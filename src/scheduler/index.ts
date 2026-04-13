import { Bot } from 'grammy';
import { readdirSync, unlinkSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { jobQueue, startWorker, JobName } from './queue';
import {
  listActiveProducts, listAllActiveProducts, getProductById, updateProductPrice, recordPrice, incrementFailures,
  getSetting, setSetting, cleanOldPriceHistory, autoDisableFailedProducts,
  getStoreStats, getTriggeredAlerts, setLastAlertMsgId, updateProductUrl,
  updateAvailability, getPriceHistory, getTrendData, getDailyDrops, getAllTimeLows,
  saveCoupon, isNewCoupon, applyAutoTarget, listActiveGenericCoupons, getEffectiveChatId,
  listSubscriptionsByType,
} from '../db/queries';
import { walCheckpoint, backupDatabase } from '../db/index';
import { scrapeUrl } from '../scrapers/index';
import { formatBRL, categoryEmoji, storeEmoji, isKit, escapeMarkdown } from '../utils/format';
import { logger } from '../utils/logger';
import { getConfig, MAX_RAM_MB } from '../config';
import { getMemoryUsage, closeBrowser, recycleBrowserIfNeeded } from '../scrapers/base';
import { evaluateConfidence } from '../utils/confidence';
import { evaluateAlerts } from './alerts';
import { calculateTrend } from '../utils/trend';
import { solveBuild } from '../data/build_solver';
import { scrapePelando } from '../scrapers/pelando';
import { processNewPromos, formatPromoMatchAlert } from '../services/promo_matcher';
import { findBestCoupon } from '../utils/coupons';
import QuickChart from 'quickchart-js';
import type { Product, AlertData, CheckProductJobData, SendAlertJobData } from '../types';


/** Inicia o processamento e o agendamento via BullMQ */
export async function startScheduler(bot: Bot): Promise<void> {
  const config = getConfig();
  const schedule = config.CRON_SCHEDULE;

  logger.info({ schedule }, '🔄 Inicializando agendamento BullMQ');

  // 0. Inicia o Worker para processar os jobs nesta instância
  startWorker(bot);

  // 1. Limpa jobs repetíveis antigos para evitar duplicação em restarts
  const repeatableJobs = await jobQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await jobQueue.removeRepeatableByKey(job.key);
  }

  // 2. Agenda os novos jobs baseados na configuração
  
  // Checagem principal (configurável pelo .env)
  await jobQueue.add(JobName.ENQUEUE_CHECKS, {}, {
    repeat: { pattern: schedule }
  });

  // Checagem noturna (03:30)
  await jobQueue.add(JobName.ENQUEUE_CHECKS, {}, {
    repeat: { pattern: '30 3 * * *' }
  });

  // Relatório Matinal (08:00)
  await jobQueue.add(JobName.MORNING_REPORT, {}, {
    repeat: { pattern: '0 8 * * *' }
  });

  // Relatório Semanal (Dom 09:00)
  await jobQueue.add(JobName.WEEKLY_REPORT, {}, {
    repeat: { pattern: '0 9 * * 0' }
  });

  // Manutenção (02:00)
  await jobQueue.add(JobName.MAINTENANCE, {}, {
    repeat: { pattern: '0 2 * * *' }
  });

  // Auto-Target (Dom 00:00)
  await jobQueue.add(JobName.AUTOTARGET, {}, {
    repeat: { pattern: '0 0 * * 0' }
  });

  // Feed de Promoções (A cada 15 min)
  await jobQueue.add(JobName.PROMO_FEED, {}, {
    repeat: { pattern: '*/15 * * * *' }
  });

  // Caçador Automático (A cada 30 min)
  await jobQueue.add(JobName.AUTO_HUNTER, {}, {
    repeat: { pattern: '*/30 * * * *' }
  });


  // Scan de Cupons (A cada 6 horas, defasado em 30min do caçador)
  await jobQueue.add(JobName.COUPON_SCAN, {}, {
    repeat: { pattern: '30 */6 * * *' }
  });

  logger.info('🚀 Todos os jobs foram agendados no BullMQ');

  // DISPARO IMEDIATO NO STARTUP:
  // Garante que o bot comece a trabalhar assim que liga, sem esperar o cronômetro.
  logger.info('⚡ [STARTUP] Disparando primeira rodada de checagem imediata...');
  await jobQueue.add(JobName.ENQUEUE_CHECKS, { force: true });
  await jobQueue.add(JobName.PROMO_FEED, {});
}

/** 
 * Enfileira a checagem de todos os produtos ativos.
 * Substitui o antigo runFullCheck como orquestrador.
 */
export async function enqueueProductChecks(bot: Bot, force: boolean = false): Promise<void> {
  const products = listAllActiveProducts();
  if (products.length === 0) {
    logger.info('Nenhum produto para checar');
    return;
  }

  logger.info({ total: products.length, force }, `🎯 [MONITORAMENTO] Enfileirando checagem de ${products.length} produtos ativos...`);

  // Auto-Restart se RAM estiver alta (executado pelo orquestrador)
  const currentRam = getMemoryUsage();
  if (currentRam > MAX_RAM_MB) {
    logger.warn({ ram: currentRam, limit: MAX_RAM_MB }, '⚠️ RAM alta detectada. Reciclando browser...');
    await closeBrowser();
  }
  await recycleBrowserIfNeeded();

  for (const product of products) {
    const jobData: CheckProductJobData = { productId: product.id, force };
    await jobQueue.add(JobName.CHECK_PRODUCT, jobData);
  }

  // Atualiza estatísticas de ciclos iniciados
  setSetting('last_full_check_initiated', new Date().toISOString());
  const totalChecksInitiated = parseInt(getSetting('total_checks_initiated') || '0') + 1;
  setSetting('total_checks_initiated', totalChecksInitiated.toString());
}

/** Processa o scraping e análise de um único produto */
export async function processSingleProduct(bot: Bot, productId: number, force: boolean = false): Promise<void> {
  const product = getProductById(productId);
  if (!product || !product.active) return;

  logger.info({ id: product.id, name: product.name, store: product.store }, `🔍 [PRODUTO] Verificando agora: ${product.name?.substring(0, 30)}... (${product.store})`);

  // Skip se checado recentemente (< 1h)
  if (!force && product.last_checked_at) {
    const lastChecked = new Date(product.last_checked_at.replace(' ', 'T'));
    const diffMs = Date.now() - lastChecked.getTime();
    if (diffMs < 3600000) {
      logger.debug({ productId: product.id, name: product.name }, '⏭️ Pulando: checado há menos de 1 hora');
      return;
    }
  }

  try {
    const urlToScrape = product.direct_url || product.url;
    const result = await scrapeUrl(urlToScrape, product.name || undefined);

    if (result?.price != null) {
      // Score de confiança
      const confidence = evaluateConfidence(result.name, product.name!, result.price, product.current_price);

      if (!confidence.isReliable) {
        logger.warn({ productId: product.id, reasons: confidence.reasons }, '🔍 Baixa confiança');
        return; 
      }

      updateProductPrice(product.id, result.price, result.name, result.productUrl);
      recordPrice(product.id, result.price, result.available);
      updateAvailability(product.id, result.available);

      if (result.coupon && isNewCoupon(product.id, result.coupon)) {
        saveCoupon(product.id, result.coupon);
      }

      const rawHistory = getPriceHistory(product.id, 15).reverse();
      const historyPrices = [...rawHistory.map(h => h.price), result.price];
      const historyDays = [...rawHistory.map(h => {
        const d = new Date(h.checked_at);
        return `${d.getDate()}/${d.getMonth()+1}`;
      }), 'Hoje'];

      const generateChartUrl = (hPrices: number[], days: string[]): string => {
        const chart = new QuickChart();
        chart.setWidth(500); chart.setHeight(250); chart.setBackgroundColor('white');
        chart.setConfig({
          type: 'line',
          data: {
            labels: days,
            datasets: [{
              label: 'Evolução', data: hPrices,
              borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 3, fill: true, tension: 0.1,
            }]
          },
          options: { legend: { display: false } }
        });
        return chart.getUrl();
      };

      const chartUrl = historyPrices.length > 2 ? generateChartUrl(historyPrices, historyDays) : undefined;
      const history30d = getTrendData(product.id);
      const trend = calculateTrend(history30d, result.price);

      // Busca cupons genéricos do Hub para esta loja
      const hubCoupons = listActiveGenericCoupons().filter(c => c.store === product.store);
      const bestCoupon = findBestCoupon(product, result.price, hubCoupons);

      const isNewResultCoupon = result.coupon ? isNewCoupon(product.id, result.coupon) : false;
      const alerts = evaluateAlerts(product, result, chartUrl, trend, isNewResultCoupon, bestCoupon || undefined); 
      
      for (const alert of alerts) {
        // Envia para chats inscritos em 'alerts' e, se for alta prioridade, para 'deals' (feed global)
        const alertSubscribers = listSubscriptionsByType('alerts');
        const dealSubscribers = alert.priority === 'high' ? listSubscriptionsByType('deals') : [];
        
        // Deduplica os inscritos (quem está em ambas as listas recebe apenas uma vez)
        const allSubscribers = [...new Set([...alertSubscribers, ...dealSubscribers])];

        for (const chatId of allSubscribers) {
          await sendAlert(chatId, alert);
        }
      }
    } else {
      incrementFailures(product.id);
      if (product.consecutive_failures >= 2) {
        const subscribers = listSubscriptionsByType('alerts');
        for (const chatId of subscribers) {
          await tryAutoRepair(bot, chatId, product);
        }
      }
    }
  } catch (e: any) {
    incrementFailures(product.id);
    logger.error({ productId: product.id, error: e.message }, 'Erro na checagem');
    throw e;
  }
}

/** Adiciona um job de envio de alerta à fila */
export async function sendAlert(chatId: string, alert: AlertData): Promise<void> {
  const jobData: SendAlertJobData = {
    chatId,
    text: alert.text,
    imageUrl: alert.imageUrl,
    productId: alert.productId
  };

  await jobQueue.add(JobName.SEND_ALERT, jobData, {
    priority: alert.priority === 'high' ? 1 : 10,
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 }
  });
}

/** Executa o envio real via API do Telegram */
export async function performSendAlert(bot: Bot, data: SendAlertJobData): Promise<void> {
  const { chatId, text, imageUrl, productId } = data;
  try {
    const product = productId ? getProductById(productId) : null;
    let sentMsgId: number | null = null;

    if (product && product.last_alert_msg_id) {
      try {
        if (imageUrl) {
          await bot.api.editMessageCaption(parseInt(chatId), product.last_alert_msg_id, {
            caption: text + '\n\n_(Atualizado)_',
            parse_mode: 'Markdown',
          });
        } else {
          await bot.api.editMessageText(parseInt(chatId), product.last_alert_msg_id, text + '\n\n_(Atualizado)_', { parse_mode: 'Markdown' });
        }
        return; 
      } catch (e) {}
    }

    if (imageUrl) {
      const msg = await bot.api.sendPhoto(parseInt(chatId), imageUrl, { caption: text, parse_mode: 'Markdown' });
      sentMsgId = msg.message_id;
    } else {
      const msg = await bot.api.sendMessage(parseInt(chatId), text, { parse_mode: 'Markdown' });
      sentMsgId = msg.message_id;
    }

    if (productId && sentMsgId) setLastAlertMsgId(productId, sentMsgId);
  } catch (e: any) {
    logger.error({ error: e.message, chatId }, 'Erro ao enviar alerta');
    throw e; 
  }
}

/** Executa tarefas de manutenção diárias */
export async function runMaintenance(bot: Bot): Promise<void> {
  const deletedHistory = cleanOldPriceHistory();
  const disabledProducts = autoDisableFailedProducts();
  const deletedDebugFiles = cleanOldDebugFiles();
  walCheckpoint();
  await backupDatabase();

  const subscribers = listSubscriptionsByType('alerts');
  if (subscribers.length > 0 && (deletedHistory > 0 || disabledProducts > 0 || deletedDebugFiles > 0)) {
    const lines = ['🧹 *Manutenção Automática*\n'];
    if (deletedHistory > 0) lines.push(`📊 ${deletedHistory} registros antigos removidos`);
    if (disabledProducts > 0) lines.push(`🚫 ${disabledProducts} produtos desativados`);
    if (deletedDebugFiles > 0) lines.push(`🖼️ ${deletedDebugFiles} arquivos de debug limpos`);
    
    for (const chatId of subscribers) {
      try {
        await bot.api.sendMessage(parseInt(chatId), lines.join('\n'), { parse_mode: 'Markdown' });
      } catch (e) {}
    }
  }
  logger.info({ deletedHistory, disabledProducts }, '🧹 Manutenção concluída');
}

/** Prepara e envia o resumo diário */
export async function sendMorningReport(bot: Bot): Promise<void> {
  const subscribers = listSubscriptionsByType('alerts');
  if (subscribers.length === 0) return;

  const activeProducts = listAllActiveProducts().length;
  const totalChecks = parseInt(getSetting('total_checks_initiated') || '0');
  const dailyDrops = getDailyDrops();
  const allTimeLows = getAllTimeLows();
  const build = solveBuild('recommended');
  
  const lines = [
    `🌅 *BOM DIA! resumo matinal:*`,
    `📦 Monitorados: ${activeProducts}`,
    `🔄 Ciclos Iniciados: ${totalChecks}`,
  ];

  if (dailyDrops.length > 0) {
    lines.push(`\n📉 *Maiores Quedas (24h):*`);
    for (const d of dailyDrops.slice(0, 3)) {
      lines.push(`   ${categoryEmoji(d.category)} ${escapeMarkdown(d.name?.substring(0, 25))}... (\\-${d.drop_percent.toFixed(0)}%)`);
      lines.push(`   💰 *${formatBRL(d.current_price!)}* na ${escapeMarkdown(storeEmoji(d.store))}`);
    }
  }

  if (allTimeLows.length > 0) {
    lines.push(`\n🔥 *No Menor Preço:*`);
    for (const a of allTimeLows.slice(0, 3)) {
      lines.push(`   ✨ ${escapeMarkdown(a.name?.substring(0, 30))}... - *${formatBRL(a.current_price!)}*`);
    }
  }

  if (build) {
    lines.push(`\n🖥️ *Build Recomendada:*`);
    lines.push(`   💰 Total: *${formatBRL(build.totalPrice)}*`);
  }

  for (const chatId of subscribers) {
    try {
      await bot.api.sendMessage(parseInt(chatId), lines.join('\n'), { parse_mode: 'Markdown' });
    } catch (e) {}
  }
}

/** Envia um relatório estatístico semanal */
export async function sendWeeklyReport(bot: Bot): Promise<void> {
  const subscribers = listSubscriptionsByType('alerts');
  if (subscribers.length === 0) return;

  const products = listAllActiveProducts();
  if (products.length === 0) return;

  const dailyDrops = getDailyDrops();
  const allTimeLows = getAllTimeLows();
  const highlights = [...dailyDrops, ...allTimeLows.map(a => ({ ...a, drop_percent: 0 }))]
    .sort((a, b) => (b.drop_percent || 0) - (a.drop_percent || 0))
    .slice(0, 5);

  const lines = ['📅 *RESUMO SEMANAL*', ''];
  highlights.forEach((p, i) => {
    lines.push(`${i+1}️⃣ ${categoryEmoji(p.category)} *${escapeMarkdown(p.name?.substring(0, 30))}...*`);
    lines.push(`   💰 *${formatBRL(p.current_price!)}* na ${escapeMarkdown(storeEmoji(p.store))}`);
  });

  for (const chatId of subscribers) {
    try {
      await bot.api.sendMessage(parseInt(chatId), lines.join('\n'), { parse_mode: 'Markdown' });
    } catch (e) {}
  }
}

/** Tenta consertar um link quebrado */
async function tryAutoRepair(bot: Bot, chatId: string, product: Product): Promise<void> {
  if (!product.name) return;
  const searchUrlMap: Record<string, (n: string) => string> = {
    amazon: (n) => `https://www.amazon.com.br/s?k=${encodeURIComponent(n)}`,
    kabum: (n) => `https://www.kabum.com.br/busca/${encodeURIComponent(n)}`,
    pichau: (n) => `https://www.pichau.com.br/search?q=${encodeURIComponent(n)}`,
    terabyte: (n) => `https://www.terabyteshop.com.br/busca?str=${encodeURIComponent(n)}`,
    mercadolivre: (n) => `https://lista.mercadolivre.com.br/${encodeURIComponent(n)}`,
  };

  const buildUrl = searchUrlMap[product.store];
  if (!buildUrl) return;

  try {
    const result = await scrapeUrl(buildUrl(product.name));
    if (result?.productUrl) {
      updateProductUrl(product.id, result.productUrl);
      await bot.api.sendMessage(parseInt(chatId), `🔧 *Link Recuperado*: ${product.name}`, { parse_mode: 'Markdown' });
    }
  } catch (e) {}
}

/** Executa a atualização automática de preços alvo */
export async function runAutoTargetUpdate(bot: Bot): Promise<void> {
  const products = listAllActiveProducts();
  let count = 0;
  for (const p of products) {
    if (applyAutoTarget(p.id).success) count++;
  }

  if (count > 0) {
    const subscribers = listSubscriptionsByType('alerts');
    for (const chatId of subscribers) {
      try {
        await bot.api.sendMessage(parseInt(chatId), `🎯 *Auto-Target*: ${count} produtos atualizados.`, { parse_mode: 'Markdown' });
      } catch (e) {}
    }
  }
}

/** Orquestra a checagem de feeds externos de promoção */
export async function runPromoFeedCheck(bot: Bot): Promise<void> {
  try {
    logger.info('🔍 Iniciando checagem de feeds de promoção externos...');
    const deals = await scrapePelando();
    
    if (deals.length === 0) {
      logger.debug('Nenhuma nova promoção encontrada no Pelando');
      return;
    }

    // 1. Envia TODAS as novas promoções para quem assina o feed global ('deals')
    const dealSubscribers = listSubscriptionsByType('deals');
    if (dealSubscribers.length > 0) {
      for (const deal of deals) {
        // Verifica se é uma promo nova (não processada anteriormente)
        // O processNewPromos já faz esse controle via DB, mas aqui fazemos para o broadcast global
        const { getDatabase } = require('../db/index');
        const db = getDatabase();
        const existing = db.prepare('SELECT id FROM external_promos WHERE source = ? AND external_id = ?')
          .get(deal.source, deal.external_id);
        
        if (!existing) {
          logger.info({ promo: deal.title }, '📢 Transmitindo nova promoção para o feed global');
          for (const chatId of dealSubscribers) {
            let msg = `🔥 *OFERTA QUENTE NO PELANDO* 🔥\n\n`;
            msg += `📦 ${escapeMarkdown(deal.title)}\n`;
            if (deal.price) msg += `💰 *${formatBRL(deal.price)}*\n`;
            if (deal.coupon) msg += `🎟️ Cupom: \`${deal.coupon}\`\n`;
            msg += `\n🔗 [Ver no Pelando](${deal.url})`;
            
            await bot.api.sendMessage(parseInt(chatId), msg, { parse_mode: 'Markdown' });
          }
        }
      }
    }

    // 2. Processa matches com produtos monitorados (para quem assina 'alerts')
    const matches = await processNewPromos(deals);
    const alertSubscribers = listSubscriptionsByType('alerts');
    
    if (alertSubscribers.length > 0) {
      for (const match of matches) {
        logger.info({ 
          promo: match.promo.title, 
          product: match.product.name 
        }, '🎯 Disparando alerta de promo casada!');

        const alertSubscribers = listSubscriptionsByType('alerts');
        const dealSubscribers = listSubscriptionsByType('deals');
        const allSubscribers = [...new Set([...alertSubscribers, ...dealSubscribers])];

        for (const chatId of allSubscribers) {
          await sendAlert(chatId, {
            productId: match.product.id,
            text: formatPromoMatchAlert(match),
            priority: 'high'
          });
        }
      }
    }
  } catch (err: any) {
    logger.error({ error: err.message }, 'Erro ao processar promo feed');
  }
}

/**
 * Remove capturas de tela e HTML de debug antigos (mais de 3 dias).
 * Também limpa arquivos órfãos na raiz do projeto.
 */
function cleanOldDebugFiles(): number {
  let count = 0;
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const pathsToScan = [
    join(process.cwd(), 'data', 'logs', 'debug'),
    process.cwd() // Para limpar o que já estava lá
  ];

  for (const dir of pathsToScan) {
    if (!existsSync(dir)) continue;

    try {
      const files = readdirSync(dir);
      for (const file of files) {
        if (file.startsWith('debug_timeout_') || file.startsWith('error_')) {
          if (file.endsWith('.png') || file.endsWith('.html')) {
            const filePath = join(dir, file);
            try {
              const stats = statSync(filePath);
              if (now - stats.mtimeMs > THREE_DAYS_MS) {
                unlinkSync(filePath);
                count++;
              }
            } catch (e: any) {
              logger.error({ file, error: e.message }, 'Erro ao deletar arquivo de debug antigo');
            }
          }
        }
      }
    } catch (e: any) {
      logger.error({ dir, error: e.message }, 'Erro ao ler diretório para limpeza');
    }
  }
  
  if (count > 0) {
    logger.info({ deleted: count }, '🧹 Arquivos de debug antigos removidos');
  }
  return count;
}


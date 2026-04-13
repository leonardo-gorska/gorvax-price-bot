import { Bot, Context, InputFile } from 'grammy';
import { logger } from '../utils/logger';
import { 
  addProduct, 
  getProductByUrl, 
  listActiveProducts, 
  updateProductPrice, 
  recordPrice, 
  getProductById, 
  getPriceHistory, 
  countActiveProducts,
  getStoreStats,
  setTargetPrice,
  setTargetPriceByCategory,
  setAlertPercent,
  exportAllProducts,
  listProductsByGroupId,
  searchProductsByName,
  updateProductGroupId,
  addSubscription,
  removeSubscription,
  incrementFailures,
  updateAvailability
} from '../db/queries';
import { scrapeUrl } from '../scrapers/index';
import { formatBRL, formatDate, priceChangeEmoji, storeEmoji, categoryEmoji, worthScoreEmoji, detectStore } from '../utils/format';
import { isValidHttpUrl, isSafeUrl } from '../utils/sanitize';
import { ProductCategory, TrendPoint } from '../types';
import { SEED_PRODUCTS } from '../db/seed';
import { paginationKeyboard, categoriesKeyboard, productActionsKeyboard, searchResultKeyboard } from './keyboards';
import { evaluateConfidence } from '../utils/confidence';
import { calculateSMA } from '../utils/math';
import QuickChart from 'quickchart-js';
import path from 'path';
import fs from 'fs';
import { readLastLines } from '../utils/file';
import { getConfig } from '../config';
import { calculateTrend } from '../utils/trend';
import { performCrossStoreSearch } from '../services/crossSearch';
import { scrapePelando } from '../scrapers/pelando';

// Constantes Locais
const ITEMS_PER_PAGE = 10;
const VALID_CATEGORIES: ProductCategory[] = [
  'cpu', 'gpu', 'motherboard', 'ram', 'ram1x16', 'ram2x16', 'ssd', 'nvme', 
  'psu', 'case', 'cooler', 'monitor', 'mouse', 'keyboard', 'headset', 
  'mousepad', 'wifi_adapter', 'webcam', 'microphone', 'peripheral', 'chair', 'other'
];

/** Função simples de similaridade de string (Jaro-Winkler simplificado ou similar) */
function simpleSimilarity(s1: string, s2: string): number {
  const n1 = s1.toLowerCase();
  const n2 = s2.toLowerCase();
  if (n1 === n2) return 1.0;
  const words1 = n1.split(/\s+/);
  const words2 = n2.split(/\s+/);
  const intersection = words1.filter(w => words2.includes(w));
  return intersection.length / Math.max(words1.length, words2.length);
}

/** Configura o menu de comandos do bot no Telegram */
async function setupBotMenu(bot: Bot): Promise<void> {
  await bot.api.setMyCommands([
    { command: 'start', description: 'Iniciar o bot e ver comandos' },
    { command: 'setup', description: 'Configurar setup PC AM5' },
    { command: 'build', description: 'Ver preços atuais da minha build 🖥️' },
    { command: 'add', description: 'Monitorar novo produto (URL)' },
    { command: 'list', description: 'Listar produtos monitorados' },
    { command: 'categories', description: 'Ver por categoria' },
    { command: 'search', description: 'Buscar em todas as lojas 🔍' },
    { command: 'deals', description: 'Melhores ofertas do momento' },
    { command: 'subscribe', description: 'Receber feed automático de ofertas 🔥' },
    { command: 'unsubscribe', description: 'Parar de receber feed automático' },
    { command: 'export', description: 'Exportar dados para CSV (Admin)' },
    { command: 'promos', description: 'Ver promoções do Pelando' },
    { command: 'alert_percent', description: 'Alerta de queda percentual' },
    { command: 'status', description: 'Status do sistema' },
    { command: 'help', description: 'Guia de uso' },
    { command: 'tutorial', description: 'Manual detalhado' },
  ]);
  logger.info('Menu de comandos do Telegram configurado');
}

/** Registra todos os comandos no bot */
export function registerCommands(bot: Bot): void {
  // Configura o menu em background
  setupBotMenu(bot).catch(err => logger.error({ err }, 'Erro ao configurar menu do bot'));


  // ─── /start ───────────────────────────────
  bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    
    // Registra o chat para alertas de monitoramento (Automático ao dar /start)
    addSubscription(chatId, 'alerts');
    logger.info({ chatId }, 'Chat registrado para receber alertas de monitoramento');

    await ctx.reply(
      `🤖 *GorvaxBot — Rastreador de Preços Enterprise*\n\n` +
      `Olá! Eu monitoro preços de peças de PC nas principais lojas do Brasil e te aviso quando o preço cair! 🔥\n\n` +
      `*Comandos principais:*\n` +
      `📌 \`/add\` \`url\` — Monitorar produto\n` +
      `📋 \`/list\` — Ver produtos monitorados\n` +
      `📂 \`/categories\` — Ver por categoria\n` +
      `🔄 \`/check\` \`id\` — Checar preço agora\n` +
      `📊 \`/history\` \`id\` — Histórico de preços\n` +
      `🔮 \`/trend\` \`id\` — Tendência de preço\n` +
      `🎯 \`/alert\` \`id\` \`preço\` — Definir alerta\n` +
      `📉 \`/alert_percent\` \`id\` \`%\` — Alerta de queda\n` +
      `🔍 \`/search\` \`termo\` — Buscar em todas as lojas\n` +
      `🗑️ \`/remove\` \`id\` — Remover produto\n\n` +
      `*Feeds e Ofertas:*\n` +
      `🔥 \`/promos\` — Ver promoções externas (Pelando)\n` +
      `📢 \`/subscribe\` — Receber feed automático de ofertas\n` +
      `🚫 \`/unsubscribe\` — Parar de receber o feed\n\n` +
      `*Outros:*\n` +
      `🔑 \`/setup\` — Configurar setup AM5 (Admin)\n` +
      `🖥️ \`/build\` — Ver preços atuais da minha build\n` +
      `📂 \`/export\` — Exportar dados CSV (Admin)\n` +
      `❓ \`/help\` — Guia rápido\n` +
      `📚 \`/tutorial\` — Manual completo\n\n` +
      `💡 _Os comandos funcionam em grupos e canais!_`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /help ────────────────────────────────
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📖 *Guia Rápido*\n\n` +
      `1️⃣ Use /setup para carregar a lista de peças do seu PC\n` +
      `2️⃣ Use /list para ver tudo que está sendo monitorado\n` +
      `3️⃣ Use /alert \`id\` \`preço\` para definir um alerta\n` +
      `4️⃣ Use /alert_percent \`id\` \`%\` para alertas de queda\n` +
      `5️⃣ Use /export para extrair dados em CSV (Admin)\n` +
      `6️⃣ O bot checa os preços automaticamente 4x por dia\n` +
      `7️⃣ Quando um preço atingir seu alvo, você recebe uma notificação! 🔔\n\n` +
      `🔔 *Dica*: Digite /tutorial para o manual completo.\n\n` +
      `*Lojas suportadas:*\n` +
      `🟠 Kabum | 🔵 Pichau | 🟢 Terabyte\n` +
      `🟡 Amazon BR | 🟣 Mercado Livre | 🔴 Magazine Luiza`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /tutorial ────────────────────────────
  bot.command('tutorial', async (ctx) => {
    await ctx.reply(
      `📚 *Tutorial Completo do GorvaxBot*\n\n` +
      `📌 */add* \`url\` \`categoria\`\n` +
      `Adiciona um produto. Categoria opcional.\n\n` +
      `📋 */list*\n` +
      `Ver produtos monitorados.\n\n` +
      `🎯 */alert* \`id\` \`preço\`\n` +
      `Avisa se o preço cair abaixo do valor.\n\n` +
      `📉 */alert_percent* \`id\` \`%\`\n` +
      `Avisa se o preço cair X% em relação ao atual.\n\n` +
      `🔥 */deals*\n` +
      `Lista as top 10 ofertas no menor preço histórico.\n\n` +
      `📊 */history* \`id\`\n` +
      `Gráfico e lista de preços passados.\n\n` +
      `🔮 */trend* \`id\`\n` +
      `Análise de trajetória do preço.\n\n` +
      `🔍 */search* \`termo\`\n` +
      `Busca em todas as lojas simultaneamente.\n\n` +
      `🔥 */promos*\n` +
      `Ver as promoções mais quentes do Pelando.\n\n` +
      `📢 */subscribe*\n` +
      `Receber feed automático de promoções externas.\n\n` +
      `📂 */export*\n` +
      `Exportar base de produtos para CSV (Admin).`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /subscribe ───────────────────────────
  bot.command('subscribe', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    addSubscription(chatId, 'deals');
    await ctx.reply(
      '🔥 *Inscrição confirmada!*\n\n' +
      'Agora este chat receberá automaticamente ofertas detectadas pelo bot.',
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /unsubscribe ─────────────────────────
  bot.command('unsubscribe', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    removeSubscription(chatId, 'deals');
    await ctx.reply(
      '🚫 *Feed desativado.*',
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /deals ───────────────────────────────
  bot.command('deals', async (ctx) => {
    const products = listActiveProducts();
    const deals = products
      .filter(p => p.current_price != null && p.lowest_price != null && p.current_price <= p.lowest_price)
      .sort((a, b) => a.current_price! - b.current_price!)
      .slice(0, 10);

    if (deals.length === 0) {
      await ctx.reply('💤 Não há nenhuma super oferta no momento.');
      return;
    }

    const lines = ['🔥 *SUPER OFERTAS DO MOMENTO* 🔥\n'];
    deals.forEach((p, i) => {
      lines.push(`${i+1}️⃣ ${categoryEmoji(p.category)} *${p.name?.substring(0, 30)}...*`);
      lines.push(`   💰 *${formatBRL(p.current_price!)}* na ${storeEmoji(p.store)} [link](${p.url})\n`);
    });

    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
  });

  // ─── /add <url> [categoria] ───────────────
  bot.command('add', async (ctx) => {
    const args = ctx.match?.trim().split(/\s+/) || [];
    const url = args[0];
    const categoryQuery = args[1]?.toLowerCase();

    if (!url) {
      await ctx.reply('❌ Use: /add <url> [categoria]');
      return;
    }

    if (!isValidHttpUrl(url)) {
      await ctx.reply('❌ URL inválida.');
      return;
    }

    const store = detectStore(url);
    if (!store) {
      await ctx.reply('❌ Loja não suportada.');
      return;
    }

    let explicitCategory: ProductCategory | undefined = undefined;
    if (categoryQuery && VALID_CATEGORIES.includes(categoryQuery as any)) {
      explicitCategory = categoryQuery as ProductCategory;
    }

    const existing = getProductByUrl(url);
    if (existing) {
      await ctx.reply(`⚠️ Já monitorado (ID: ${existing.id})`);
      return;
    }

    await ctx.reply('🔍 Analisando produto...');
    const result = await scrapeUrl(url);

    let groupId = `group_${Date.now()}`;
    if (result?.name) {
      const existingSimilar = listActiveProducts().find(p => simpleSimilarity(p.name || '', result.name) > 0.6);
      if (existingSimilar?.group_id) groupId = existingSimilar.group_id;
    }

    const product = addProduct({
      url,
      store,
      category: explicitCategory || 'other',
      name: result?.name || undefined,
      is_watchlist: 0,
      group_id: groupId,
    });

    if (result?.price) {
      updateProductPrice(product.id, result.price, result.name);
      recordPrice(product.id, result.price, result.available);
    }

    await ctx.reply(
      `✅ *Adicionado!* (ID: ${product.id})\n\n` +
      `📦 [${result?.name || 'Link'}](${url})\n` +
      `💰 Preço: ${result?.price ? formatBRL(result.price) : '???'}`,
      {
        parse_mode: 'Markdown',
        reply_markup: productActionsKeyboard(product.id, 0),
        link_preview_options: { is_disabled: true },
      }
    );
  });

  // ─── /trend <id> ──────────────────────────
  bot.command('trend', async (ctx) => {
    const id = parseInt(ctx.match?.trim() || '');
    if (isNaN(id)) return ctx.reply('❌ Use: /trend <id>');

    const product = getProductById(id);
    if (!product) return ctx.reply('❌ Não encontrado.');

    const history = getPriceHistory(id, 30);
    const trend = calculateTrend(history as any[], product.current_price || 0);
    
    const emojiMap: Record<string, string> = { 
      down: '📉 Queda', 
      up: '📈 Alta', 
      stable_low: '💎 Mínimo Estável', 
      neutral: '➖ Estável' 
    };
    
    await ctx.reply(
      `🔮 *Tendência — ${product.name}*\n\n` +
      `Trajetória: *${emojiMap[trend.direction]}*\n` +
      `Variação: ${trend.changePercent.toFixed(1)}%\n` +
      `Estável no Mínimo: ${trend.isLowestStable ? 'Sim' : 'Não'}`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /list ────────────────────────────────
  bot.command('list', async (ctx) => {
    const products = listActiveProducts();
    if (products.length === 0) return ctx.reply('📭 Lista vazia.');

    const pageProducts = products.slice(0, ITEMS_PER_PAGE);
    const lines = [`📋 *Monitorados* (${products.length})\n`];
    for (const p of pageProducts) {
      lines.push(`${categoryEmoji(p.category)} *#${p.id}* [${p.name?.substring(0, 20)}](${p.url})\n   💰 ${p.current_price ? formatBRL(p.current_price) : '—'}`);
    }

    await ctx.reply(lines.join('\n'), {
      parse_mode: 'Markdown',
      reply_markup: products.length > ITEMS_PER_PAGE ? paginationKeyboard(1, Math.ceil(products.length / ITEMS_PER_PAGE), 'list') : undefined,
    });
  });

  // ─── /search <nome> ───────────────────────
  bot.command('search', async (ctx) => {
    const query = ctx.match?.trim();
    if (!query) return ctx.reply('❌ O que deseja buscar?');

    await ctx.reply('🔍 Buscando...');
    const results = await performCrossStoreSearch(query, 'other', '');
    if (results.length === 0) return ctx.reply('❌ Nada encontrado.');

    const lines = [`🔍 *Resultados para: "${query}"*\n`];
    results.slice(0, 5).forEach((r, i) => lines.push(`${i+1}️⃣ ${storeEmoji(r.store as any)} [${r.name}](${r.url}) — *${formatBRL(r.price || 0)}*`));

    await ctx.reply(lines.join('\n'), {
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });
  });

  // ─── /status ──────────────────────────────
  bot.command('status', async (ctx) => {
    const count = countActiveProducts();
    const stats = getStoreStats();
    await ctx.reply(`📊 *Status*\n📦 Monitorados: ${count}\n⚡ Monitor: Ativo`, { parse_mode: 'Markdown' });
  });

  // ─── /setup ───────────────────────────────
  bot.command('setup', async (ctx) => {
    const config = getConfig();
    if (config.ADMIN_ID && ctx.from?.id.toString() !== config.ADMIN_ID) return ctx.reply('⛔');

    await ctx.reply('🔄 Carregando seed...');
    for (const p of SEED_PRODUCTS) {
      if (!getProductByUrl(p.url)) addProduct(p as any);
    }
    await ctx.reply('✅ Pronto!');
  });

  // ─── /build ────────────────────────────────
  bot.command('build', async (ctx) => {
    const { getBestPricePerCategory } = require('../db/queries');
    const { formatBRL, categoryEmoji, storeEmoji } = require('../utils/format');
    const bestPrices = getBestPricePerCategory();
    
    if (bestPrices.length === 0) {
      await ctx.reply('❌ Nenhuma peça monitorada ainda. Use /setup ou /add primeiro.');
      return;
    }

    let total = 0;
    const lines = ['🖥️ *STATUS DO SETUP (MELHORES PREÇOS)*\n'];
    
    bestPrices.forEach((p: any) => {
      total += p.best_price;
      lines.push(`${categoryEmoji(p.category)} *${p.category.toUpperCase()}:*`);
      lines.push(`   ${p.name?.substring(0, 35)}...`);
      lines.push(`   💰 *${formatBRL(p.best_price)}* na ${storeEmoji(p.store)} [link](${p.url})\n`);
    });

    lines.push('─'.repeat(20));
    lines.push(`💵 *INVESTIMENTO TOTAL:* *${formatBRL(total)}*`);
    lines.push('\n💡 _Preços baseados no valor à vista (PIX) monitorado agora._');

    await ctx.reply(lines.join('\n'), { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });
  });

  // ─── /export ────────────────────────────────
  bot.command('export', async (ctx) => {
    const config = getConfig();
    if (config.ADMIN_ID && ctx.from?.id.toString() !== config.ADMIN_ID) return;

    const products = exportAllProducts();
    const csvLines = [
      'id,name,store,category,current_price,lowest_price,target_price,url'
    ];

    products.forEach(p => {
      const line = [
        p.id,
        `"${p.name?.replace(/"/g, '""')}"`,
        p.store,
        p.category,
        p.current_price || '',
        p.lowest_price || '',
        p.target_price || '',
        p.url
      ].join(',');
      csvLines.push(line);
    });

    const filePath = path.join(process.cwd(), 'tmp', `export_${Date.now()}.csv`);
    if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
    
    fs.writeFileSync(filePath, csvLines.join('\n'));
    
    await ctx.replyWithDocument(new InputFile(filePath), { caption: '📊 Exportação completa dos produtos monitorados.' });
    
    // Deleta o arquivo após 10 segundos
    setTimeout(() => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 10000);
  });

  // ─── /promos ────────────────────────────────
  bot.command('promos', async (ctx) => {
    await ctx.reply('🔍 Buscando promoções recentes no Pelando...');
    const promos = await scrapePelando();

    if (promos.length === 0) {
      await ctx.reply('❌ Nenhuma promoção encontrada no momento.');
      return;
    }

    const lines = ['🔥 *PROMOÇÕES RECENTES (PELANDO)* 🔥\n'];
    promos.slice(0, 8).forEach((p, i) => {
      lines.push(`${i + 1}️⃣ *${p.title.substring(0, 45)}...*`);
      lines.push(`   💰 *${p.price ? formatBRL(p.price) : '???'}* ${p.coupon ? `(Cupom: \`${p.coupon}\`)` : ''}`);
      lines.push(`   🔗 [Ver no Pelando](${p.url})\n`);
    });

    await ctx.reply(lines.join('\n'), { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });
  });

  // ─── /alert_percent <id> <porcentagem> ──────
  bot.command('alert_percent', async (ctx) => {
    const args = ctx.match?.trim().split(/\s+/) || [];
    const id = parseInt(args[0]);
    const percent = parseInt(args[1]);

    if (isNaN(id) || isNaN(percent)) {
      await ctx.reply('❌ Use: /alert_percent <id> <porcentagem>\nEx: `/alert_percent 15 10` (Alerta se cair 10%)', { parse_mode: 'Markdown' });
      return;
    }

    const product = getProductById(id);
    if (!product) return ctx.reply('❌ Produto não encontrado.');

    setAlertPercent(id, percent);
    await ctx.reply(`✅ *Alerta configurado!* Você será avisado se o preço de *${product.name}* cair ${percent}% ou mais.`, { parse_mode: 'Markdown' });
  });
}

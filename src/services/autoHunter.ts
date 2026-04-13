import { Bot } from 'grammy';
import { HUNTER_TARGETS } from '../config/hunter_targets';
import { performCrossStoreSearch, CrossSearchResult } from './crossSearch';
import { calculateMedian } from '../utils/math';
import { logger } from '../utils/logger';
import { HunterHit, HunterTarget } from '../types';
import { getEffectiveChatId } from '../db/queries';
import { formatBRL, storeEmoji, categoryEmoji } from '../utils/format';

/**
 * Serviço de Caçador Automático (Auto Hunter).
 * Monitora itens de alta demanda e identifica "bugs de preço" ou outliers reais.
 */
export class AutoHunterService {
  private lastAlerts = new Set<string>(); // Evita spam do mesmo link no mesmo ciclo

  /**
   * Executa uma varredura global baseada nos alvos configurados.
   */
  async runAutoHunter(bot: Bot) {
    const chatId = getEffectiveChatId();
    if (!chatId) {
      logger.warn('Caçador Automático: Chat ID (chat_id) não encontrado nas configurações.');
      return;
    }

    logger.info('🎯 Ciclo do Caçador Automático iniciado...');

    for (const target of HUNTER_TARGETS) {
      try {
        // Busca em todas as lojas suportadas
        const results = await performCrossStoreSearch(target.query, target.category, 'none');
        
        if (results.length < 3) {
          logger.debug({ query: target.query }, 'Resultados insuficientes para análise estatística.');
          continue;
        }

        const hits = this.detectOutliers(target, results);
        
        for (const hit of hits) {
          if (this.lastAlerts.has(hit.url)) continue;

          await this.notifyHit(bot, chatId, hit);
          this.lastAlerts.add(hit.url);
          
          // Limpeza básica do cache se crescer demais
          if (this.lastAlerts.size > 500) this.lastAlerts.clear();
        }
      } catch (err: any) {
        logger.error({ query: target.query, error: err.message }, 'Erro ao caçar alvo específico');
      }
    }

    logger.info('✅ Ciclo do Caçador Automático finalizado.');
  }

  /**
   * Identifica preços que estão fora do desvio padrão/mediana do mercado.
   */
  private detectOutliers(target: HunterTarget, results: CrossSearchResult[]): HunterHit[] {
    const validPrices = results
      .map(r => r.price)
      .filter((p): p is number => p !== null && p > 50); // Ignora itens < R$ 50 (falsos positivos comuns)

    if (validPrices.length < 3) return [];

    const median = calculateMedian(validPrices);
    const hits: HunterHit[] = [];

    for (const res of results) {
      if (!res.price || res.price <= 50) continue;

      // Cálculo de economia em relação à mediana
      const savings = (median - res.price) / median;
      
      /**
       * CRITÉRIOS DE FILTRAGEM:
       * 1. Economia >= 18% (Desconto real agressivo)
       * 2. Economia <= 75% (Evita erros de precificação/bugs de centavos)
       * 3. Similaridade >= 0.85 (Garante que o produto é o correto)
       */
      if (savings >= 0.18 && savings <= 0.75 && res.similarity >= 0.85) {
        // Validação extra por keywords obrigatórias
        const nameUpper = res.name.toUpperCase();
        const hasKeywords = target.keywords.every(kw => nameUpper.includes(kw.toUpperCase()));
        
        if (hasKeywords) {
          hits.push({
            target,
            store: res.store,
            url: res.url,
            name: res.name,
            price: res.price,
            medianPrice: median,
            savingsPercent: Math.round(savings * 100)
          });
        }
      }
    }

    return hits;
  }

  /**
   * Envia o alerta formatado para o chat principal.
   */
  private async notifyHit(bot: Bot, chatId: string, hit: HunterHit) {
    const text = 
      `🎯 *CAÇADOR AUTOMÁTICO: ACHADO!*\n` +
      `───────────────────\n` +
      `${categoryEmoji(hit.target.category)} *${hit.name}*\n` +
      `🏪 Loja: *${hit.store.toUpperCase()}*\n` +
      `💰 Preço: *${formatBRL(hit.price)}*\n` +
      `📊 Média Mercado: ${formatBRL(hit.medianPrice)}\n` +
      `📉 Desconto: *${hit.savingsPercent}% abaixo da média!*\n` +
      `───────────────────\n` +
      `🔗 ${hit.url}`;

    try {
      await bot.api.sendMessage(parseInt(chatId), text, { parse_mode: 'Markdown' });
      logger.info({ product: hit.name, savings: hit.savingsPercent }, '🚀 Notificação de achado disparada!');
    } catch (err: any) {
      logger.error({ error: err.message }, 'Erro ao notificar achado do caçador');
    }
  }
}

export const autoHunterService = new AutoHunterService();

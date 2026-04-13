// ============================================
// Service — Promo Matcher (Cruzamento de Ofertas)
// ============================================

import { getDatabase } from '../db/index';
import { ExternalPromo, Product } from '../types';
import { stringSimilarity } from '../utils/confidence';
import { logger } from '../utils/logger';
import { formatBRL, escapeMarkdown } from '../utils/format';

export interface PromoMatch {
  promo: ExternalPromo;
  product: Product;
  similarity: number;
}

/**
 * Processa novas promoções, salva no banco e retorna matches relevantes
 */
export async function processNewPromos(promos: ExternalPromo[]): Promise<PromoMatch[]> {
  const db = getDatabase();
  const matches: PromoMatch[] = [];

  // Busca todos os produtos ativos para comparação
  const activeProducts = db.prepare('SELECT * FROM products WHERE active = 1').all() as Product[];

  for (const promo of promos) {
    try {
      // 1. Verifica se já processamos esta promo (external_id + source)
      const existing = db.prepare('SELECT id FROM external_promos WHERE source = ? AND external_id = ?')
        .get(promo.source, promo.external_id);
      
      if (existing) continue;

      // 2. Salva a promo no banco para não repetir
      db.prepare(`
        INSERT INTO external_promos (source, external_id, title, price, url, coupon)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(promo.source, promo.external_id, promo.title, promo.price, promo.url, promo.coupon);

      // 3. Tenta encontrar um match com produtos monitorados
      for (const product of activeProducts) {
        if (!product.name) continue;

        const similarity = stringSimilarity(promo.title, product.name);

        // Se a similaridade for alta (> 0.6 para promoções externas)
        if (similarity >= 0.55) {
          // Se houver preço na promo, verifica se vale a pena (ex: menor que o atual ou menor que o target)
          let isGoodPrice = true;
          if (promo.price && product.current_price) {
            // Se o preço da promo for maior que o preço atual que já temos, talvez não seja tão interessante
            // Mas promoções de cupom às vezes batem o preço de busca, então mantemos um threshold generoso
            if (promo.price > product.current_price * 1.05) {
              isGoodPrice = false;
            }
          }

          if (isGoodPrice) {
            matches.push({ promo, product, similarity });
            logger.info({ 
              promo: promo.title, 
              match: product.name, 
              similarity 
            }, '🎯 Encontrado match de promoção externa!');
          }
        }
      }
    } catch (err: any) {
      logger.error({ error: err.message, promoID: promo.external_id }, 'Erro ao processar promoção individual');
    }
  }

  return matches;
}

/**
 * Formata a mensagem de alerta para uma promoção casada
 */
export function formatPromoMatchAlert(match: PromoMatch): string {
  const { promo, product } = match;
  
  let msg = `🔥 *OFERTA ENCONTRADA NO ${escapeMarkdown(promo.source.toUpperCase())}*\n\n`;
  msg += `📦 *Produto:* ${escapeMarkdown(promo.title)}\n`;
  
  if (promo.price) {
    msg += `💰 *Preço:* ${formatBRL(promo.price)}\n`;
    if (product.current_price) {
      const diff = product.current_price - promo.price;
      if (diff > 0) {
        msg += `📉 *Economia:* -${formatBRL(diff)} em relação ao preço atual\n`;
      }
    }
  }

  if (promo.coupon) {
    msg += `🎟️ *CUPOM:* \`${promo.coupon}\`\n`;
  }

  msg += `\n🔗 [Ver Promoção no Pelando](${promo.url})\n`;
  msg += `🛒 [Página que você monitora](${product.url})`;

  return msg;
}

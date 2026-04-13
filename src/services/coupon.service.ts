import { kabumCouponScraper } from '../scrapers/coupons/kabum';
import { amazonCouponScraper } from '../scrapers/coupons/amazon';
import { terabyteCouponScraper } from '../scrapers/coupons/terabyte';
import { aliexpressCouponScraper } from '../scrapers/coupons/aliexpress';
import { mercadolivreCouponScraper } from '../scrapers/coupons/mercadolivre';
import { saveGenericCoupon, getEffectiveChatId } from '../db/queries';
import { logger } from '../utils/logger';
import { Bot } from 'grammy';
import { storeEmoji } from '../utils/format';
import { isProductEligible, calculateDiscountedPrice } from '../utils/coupons';

export class CouponService {
  private scrapers = [
    kabumCouponScraper,
    amazonCouponScraper,
    terabyteCouponScraper,
    aliexpressCouponScraper,
    mercadolivreCouponScraper,
  ];

  /**
   * Executa o scan em todos os hubs de cupons e salva no banco.
   * Se um cupom novo de alto valor for encontrado, notifica o usuário.
   */
  async runCouponScan(bot: Bot): Promise<void> {
    logger.info('🔍 Iniciando scan proativo de cupons...');
    const chatId = getEffectiveChatId();

    for (const scraper of this.scrapers) {
      try {
        const discovered = await scraper.scrape();
        for (const couponData of discovered) {
          // Evita spam: só notifica se for um cupom que acabamos de descobrir ou se for "novo" no banco
          const { listActiveGenericCoupons, listProductsByStore } = require('../db/queries');
          const existingCoupons = listActiveGenericCoupons();
          const isNew = !existingCoupons.some((c: any) => c.code === couponData.code && c.store === couponData.store);

          saveGenericCoupon(couponData);
          
          if (!chatId || !isNew) continue;

          // Matching: Busca produtos monitorados da MESMA loja
          const products = listProductsByStore(couponData.store || '');
          
          const eligibleProducts = products.filter((p: import('../types').Product) => {
            if (!p.current_price) return false;
            
            // Reusa a lógica central de elegibilidade
            if (!isProductEligible(p, p.current_price, couponData as import('../types').GenericCoupon)) {
              return false;
            }

            const finalPrice = calculateDiscountedPrice(p.current_price, couponData as import('../types').GenericCoupon);
            const discount = p.current_price - finalPrice;
            const discountPercent = (discount / p.current_price) * 100;

            // Notifica se: atingiu target_price OU desconto > 15%
            const hitTarget = p.target_price && finalPrice <= p.target_price;
            const isGreatDeal = discountPercent >= 15;

            return hitTarget || isGreatDeal;
          });

          if (eligibleProducts.length > 0) {
            const { formatBRL } = require('../utils/format');
            const topProducts = eligibleProducts.slice(0, 3);
            let msg = `🎯 *OPORTUNIDADE DE CUPOM (${couponData.store?.toUpperCase()})*\n\n` +
                      `🎫 Cupom: \`${couponData.code}\`\n` +
                      `📝 ${couponData.description}\n\n` +
                      `🔥 *Produtos monitorados com preço reduzido:* \n`;
            
            topProducts.forEach((p: import('../types').Product) => {
              const finalPrice = calculateDiscountedPrice(p.current_price!, couponData as import('../types').GenericCoupon);
              
              msg += `• ${p.name?.substring(0, 40)}${p.name && p.name.length > 40 ? '...' : ''} \n` +
                     `  💰 De ${storeEmoji(p.store)} ~~${formatBRL(p.current_price!)}~~ por *${formatBRL(finalPrice)}*\n`;
            });

            if (eligibleProducts.length > 3) {
              msg += `...e mais ${eligibleProducts.length - 3} itens.\n`;
            }

            msg += `\n🛒 Use o cupom no carrinho!`;
            
            logger.info({ store: couponData.store, code: couponData.code, matchedItems: eligibleProducts.length }, '🎯 Cupom matched e alerta enviado');
            
            try {
              await bot.api.sendMessage(parseInt(chatId), msg, { parse_mode: 'Markdown' });
            } catch (err: any) {
              logger.error({ error: err.message }, 'Falha ao enviar mensagem de cupom');
            }
          }
        }
      } catch (err: any) {
        logger.error({ store: scraper.name, error: err.message }, 'Erro ao processar cupons da loja');
      }
    }
    
    logger.info('✅ Scan de cupons finalizado');
  }
}

export const couponService = new CouponService();

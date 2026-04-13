import { mercadolivreCouponScraper } from '../scrapers/coupons/mercadolivre';
import { logger } from '../utils/logger';

async function run() {
  logger.info('🧪 Testando scraper de cupons do Mercado Livre...');
  
  try {
    const discovered = await mercadolivreCouponScraper.scrape();
    
    if (discovered.length === 0) {
      logger.warn('⚠️ Nenhum cupom publicamente visível encontrado. Isso pode ser normal se não houver campanhas ativas.');
    } else {
      logger.info({ count: discovered.length }, '✅ Cupons encontrados!');
      discovered.forEach((c, i) => {
        logger.info(`${i + 1}. [${c.code}] ${c.description} - Desconto: ${c.discount_value}${c.discount_type === 'percent' ? '%' : ' BRL'} (Mín: ${c.min_purchase || 'N/A'})`);
      });
    }
  } catch (err: any) {
    logger.error({ error: err.message }, '❌ Erro durante o teste de cupons');
  }
  
  process.exit(0);
}

run().catch(console.error);

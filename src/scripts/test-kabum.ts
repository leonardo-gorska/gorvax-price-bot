import { kabumScraper } from '../scrapers/kabum';
import { logger } from '../utils/logger';

async function test() {
  const urls = [
    'https://www.kabum.com.br/produto/705112/pc-gamer-completo-ryzen-5-5500-rtx-4060-16gb-ddr4-ssd-nvme-500gb-600w-80-plus-mad007-e',
    'https://www.kabum.com.br/produto/472797/processador-amd-ryzen-5-5600g-3-9ghz-4-4ghz-max-turbo-cache-19mb-am4-video-integrado-100-100000252box'
  ];

  for (const url of urls) {
    logger.info(`🚀 Testando KaBuM Scraper com URL: ${url}`);

    const result = await kabumScraper.scrape(url);
    
    if (!result) {
      logger.error('❌ Scraper retornou nulo (provavelmente bloqueio ou erro crítico).');
      continue;
    }

    console.log('\n' + '='.repeat(40));
    console.log(`URL: ${url}`);
    console.log(`Nome: ${result.name}`);
    console.log(`Preço: ${result.price}`);
    console.log(`Preço Original: ${result.originalPrice}`);
    console.log(`Disponível: ${result.available}`);
    console.log(`URL Imagem: ${result.imageUrl}`);
    console.log(`Cupom: ${result.coupon}`);
    console.log('='.repeat(40) + '\n');

    if (result.price === null && result.available) {
      logger.warn('⚠️ Preço está NULO mesmo estando disponível! O problema foi reproduzido.');
    } else {
      logger.info('✅ Scrape concluído.');
    }
  }
}

test().catch(console.error);

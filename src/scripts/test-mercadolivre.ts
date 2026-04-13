import { mercadolivreScraper } from '../scrapers/mercadolivre';
import { logger } from '../utils/logger';

async function run() {
  logger.info('Testando scraper do Mercado Livre...');
  
  // Example ML URL
  const url = 'https://produto.mercadolivre.com.br/MLB-4770381622-processador-amd-ryzen-5-5600gt-com-video-integrado-cooler-_JM';
  
  const result = await mercadolivreScraper.scrape(url);
  logger.info({ result }, 'Scrape finalizado');
  
  process.exit(0);
}

run().catch(console.error);

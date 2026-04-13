import { amazonScraper } from '../scrapers/amazon';
import { logger } from '../utils/logger';
import { writeFileSync } from 'fs';
import { fetchHtml, getDebugPath } from '../scrapers/base';

async function test() {
  const testCases = [
    {
      name: 'RTX 4060',
      url: 'https://www.amazon.com.br/s?k=rtx+4060'
    },
    {
      name: 'Placa Galax Geforce RTX 4060',
      url: 'https://www.amazon.com.br/Placa-Galax-Geforce-1-click-128bits/dp/B0CV5RYV78/'
    }
  ];

  for (const testCase of testCases) {
    logger.info(`🚀 Testando Amazon Scraper para: ${testCase.name}`);
    logger.info(`URL: ${testCase.url}`);

    const result = await amazonScraper.scrape(testCase.url, testCase.name);
    
    if (!result) {
      logger.error('❌ Scraper retornou nulo.');
      continue;
    }

    console.log('\n' + '='.repeat(40));
    console.log(`Busca/Produto: ${testCase.name}`);
    console.log(`Resultado Nome: ${result.name}`);
    console.log(`Preço: ${result.price}`);
    console.log(`Disponível: ${result.available}`);
    console.log(`URL Produto: ${result.productUrl}`);
    console.log(`URL Imagem: ${result.imageUrl}`);
    console.log('='.repeat(40) + '\n');

    if (result.name === 'Produto Amazon' && !result.price) {
      logger.warn('⚠️ Resultado parece ser genérico ou falhou na extração!');
    } else {
      logger.info('✅ Scrape concluído.');
    }
  }
}

test().catch(console.error);

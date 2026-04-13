import { magazineluizaScraper } from '../scrapers/magazineluiza';
import { logger } from '../utils/logger';
import { writeFileSync } from 'fs';
import { fetchHtml, getDebugPath } from '../scrapers/base';

async function test() {
  const testCases = [
    {
      name: 'iPhone 15 Magalu',
      url: 'https://www.magazineluiza.com.br/apple-iphone-15-128gb-preto-61-48mp-ios-5g/p/238035600/te/ip15/?seller_id=magazineluiza'
    }
  ];

  for (const testCase of testCases) {
    logger.info(`🚀 Testando Magalu Scraper para: ${testCase.name}`);
    
    const html = await fetchHtml(
      testCase.url, false, true, 1,
      'h1, [data-testid="price-value"]'
    );
    
    if (html) {
      const fileName = getDebugPath('magalu_debug.html');
      writeFileSync(fileName, html);
      logger.info(`💾 HTML salvo em ${fileName}`);
    }

    const result = await magazineluizaScraper.scrape(testCase.url);
    
    if (result) {
      console.log('\n' + '='.repeat(40));
      console.log(`Produto: ${result.name}`);
      console.log(`Preço: ${result.price}`);
      console.log(`Disponível: ${result.available}`);
      console.log(`Varições: ${result.variations?.length || 0}`);
      console.log('='.repeat(40) + '\n');
    } else {
      logger.error('❌ Falha no scrape');
    }
  }
}

test().catch(console.error);

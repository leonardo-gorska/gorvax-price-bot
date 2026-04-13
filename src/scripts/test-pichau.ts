import { pichauScraper } from '../scrapers/pichau';
import { logger } from '../utils/logger';
import { writeFileSync } from 'fs';
import { fetchHtml, getDebugPath } from '../scrapers/base';

async function test() {
  const testCases = [
    {
      name: 'RTX 4060',
      url: 'https://www.pichau.com.br/search?q=rtx+4060'
    }
  ];

  for (const testCase of testCases) {
    logger.info(`🚀 Testando Pichau Scraper (Busca) para: ${testCase.name}`);
    logger.info(`URL: ${testCase.url}`);

    // Pegar o HTML bruto para inspeção manual
    const html = await fetchHtml(
      testCase.url, false, true, 1,
      'a[href*="/produto/"], [data-cy="list-product"], [class*="MuiCardContent"]'
    );
    
    if (html) {
      const fileName = getDebugPath('pichau_debug.html');
      writeFileSync(fileName, html);
      logger.info(`💾 HTML salvo em ${fileName} para análise.`);
    }

    const result = await pichauScraper.scrape(testCase.url, testCase.name);
    
    if (!result) {
      logger.error('❌ Scraper retornou nulo.');
      continue;
    }

    console.log('\n' + '='.repeat(40));
    console.log(`Busca: ${testCase.name}`);
    console.log(`Resultado Nome: ${result.name}`);
    console.log(`Preço: ${result.price}`);
    console.log(`Disponível: ${result.available}`);
    console.log(`URL Produto: ${result.productUrl}`);
    console.log(`URL Imagem: ${result.imageUrl}`);
    console.log('='.repeat(40) + '\n');

    if (result.name.toLowerCase().includes('patrocinado') || result.name === 'Produto Pichau') {
      logger.warn('⚠️ Resultado parece ser patrocinado ou genérico!');
    } else {
      logger.info('✅ Scrape concluído.');
    }
  }
}

test().catch(console.error);

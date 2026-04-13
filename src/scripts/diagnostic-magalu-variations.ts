import { magazineluizaScraper } from '../scrapers/magazineluiza';
import { logger } from '../utils/logger';
import { fetchHtml, getDebugPath } from '../scrapers/base';
import { writeFileSync } from 'fs';

async function diagnostic() {
  console.log('--- DIAGNOSTIC START ---');
  const url = 'https://www.magazineluiza.com.br/apple-iphone-15-128gb-preto-61-48mp-ios-5g/p/238035600/te/ip15/?seller_id=magazineluiza';
  
  logger.info(`🔍 Diagnosticando Magalu para: ${url}`);
  
  try {
    const result = await magazineluizaScraper.scrape(url);
    
    const html = await fetchHtml(url, false, true, 1, 'h1');
    if (html) {
      const htmlPath = getDebugPath('diagnostic_magalu.html');
      writeFileSync(htmlPath, html);
      console.log(`Saved HTML to ${htmlPath}`);

      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
      if (nextDataMatch) {
        const jsonPath = getDebugPath('magalu_next_data.json');
        writeFileSync(jsonPath, JSON.stringify(JSON.parse(nextDataMatch[1]), null, 2));
        console.log(`Saved JSON to ${jsonPath}`);
      }
    }
    
    if (result) {
      console.log('\n' + '='.repeat(60));
      console.log(`Produto: ${result.name}`);
      console.log(`Preço: ${result.price}`);
      console.log(`Disponível: ${result.available}`);
      console.log(`Total Varições: ${result.variations?.length || 0}`);
      
      if (result.variations) {
        console.log('\nLISTA DE VARIAÇÕES:');
        result.variations.forEach((v, i) => {
          console.log(`${i+1}. [${v.label}] ${v.value} - ${v.available ? '✅ Disponível' : '❌ Esgotado'} - URL: ${v.url}`);
        });
      }
      console.log('='.repeat(60) + '\n');
    } else {
      logger.error('❌ Falha no scrape');
    }
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  }
}

diagnostic().catch(console.error);

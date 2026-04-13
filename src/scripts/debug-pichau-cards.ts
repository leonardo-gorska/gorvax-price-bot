import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('pichau_debug.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- CARDS data-cy="list-product" ENCONTRADOS ---');
$('[data-cy="list-product"]').each((i, el) => {
  const card = $(el);
  const title = card.find('h2').first().text().trim() || 
                card.find('a[href*="/produto/"]').first().text().trim() || 
                'SEM TITULO';
  const price = card.text().match(/R\$\s*[\d.]+,\d{2}/)?.[0];
  const isSponsored = card.text().toLowerCase().includes('patrocinado') || 
                      card.text().toLowerCase().includes('anúncio');
  
  console.log(`${i+1}. [${isSponsored ? 'SPONSORED' : 'NORMAL'}] ${title} - ${price}`);
  // if (i === 0) console.log('HTML Fragment:', card.html().substring(0, 500));
});

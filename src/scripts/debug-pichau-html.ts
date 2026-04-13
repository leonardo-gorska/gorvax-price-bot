import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { getDebugPath } from '../scrapers/base';

const inputPath = getDebugPath('pichau_debug.html');
if (!fs.existsSync(inputPath)) {
  console.error(`Arquivo não encontrado: ${inputPath}`);
  process.exit(1);
}
const html = fs.readFileSync(inputPath, 'utf8');
const $ = cheerio.load(html);

console.log('--- PRODUTOS ENCONTRADOS ---');
$('a[href*="/produto/"]').each((i, el) => {
  const link = $(el);
  const parent = link.closest('div').parent(); // Simulating current scraper logic
  const title = parent.find('h2').first().text().trim() || link.text().trim();
  const price = parent.text().match(/R\$\s*[\d.]+,\d{2}/)?.[0];
  const isSponsored = parent.text().toLowerCase().includes('patrocinado') || 
                      parent.text().toLowerCase().includes('anúncio');
  
  if (title) {
    console.log(`${i+1}. [${isSponsored ? 'SPONSORED' : 'NORMAL'}] ${title} - ${price}`);
    // console.log('   Text snippet:', parent.text().substring(0, 100).replace(/\s+/g, ' '));
  }
});

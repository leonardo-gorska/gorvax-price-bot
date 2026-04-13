import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { stringSimilarity } from '../utils/confidence';

const html = fs.readFileSync('pichau_debug.html', 'utf8');
const $ = cheerio.load(html);
const expectedName = 'RTX 4060';

console.log('--- DIAGNÓSTICO ESTRATÉGIA 1 (JSON-LD) ---');
const jsonLd = $('script[type="application/ld+json"]').toArray();
for (const script of jsonLd) {
  try {
    const data = JSON.parse($(script).html() || '');
    const products = Array.isArray(data) 
      ? data.filter((d: any) => d['@type'] === 'Product') 
      : (data['@type'] === 'Product' ? [data] : []);
    
    for (const product of products) {
      const productName = product.name || '';
      const score = stringSimilarity(productName, expectedName);
      
      const titleLower = productName.toLowerCase();
      const negativeKeywords = ['pc gamer', 'computador', 'kit upgrade', 'montado', 'configuração'];
      const isIrrelevant = negativeKeywords.some(kw => 
        titleLower.includes(kw) && !expectedName.toLowerCase().includes(kw)
      );
      
      const price = product.offers?.price || product.offers?.[0]?.price;

      console.log(`\nProd: ${productName}`);
      console.log(`Price: ${price} | Score: ${score.toFixed(4)} | Irrelevant: ${isIrrelevant}`);
    }
  } catch (e) {}
}

console.log('\n--- DIAGNÓSTICO ESTRATÉGIA 2 (DOM) ---');
const productLinks = $('a[href*="/produto/"]').toArray();
for (const link of productLinks) {
  const parent = $(link).closest('div').parent();
  if (parent.length && parent.text().includes('R$')) {
    const title = parent.find('h2').first().text().trim() ||
                  parent.find('a[href*="/produto/"]').first().text().trim() || '';
    const score = stringSimilarity(title, expectedName);
    const isIrrelevant = ['pc gamer', 'computador', 'kit upgrade', 'montado', 'configuração'].some(kw => 
      title.toLowerCase().includes(kw) && !expectedName.toLowerCase().includes(kw)
    );
    const priceText = parent.text().match(/R\$\s*[\d.]+,\d{2}/)?.[0];
    
    if (title) {
        console.log(`\nCard: ${title}`);
        console.log(`Price: ${priceText} | Score: ${score.toFixed(4)} | Irrelevant: ${isIrrelevant}`);
    }
  }
}

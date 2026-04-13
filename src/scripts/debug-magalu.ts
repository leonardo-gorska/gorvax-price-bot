import { magazineluizaScraper } from '../scrapers/magazineluiza';

async function debug() {
  const url = 'https://www.magazineluiza.com.br/apple-watch-series-9-gps-cellular-caixa-rosa-de-aluminio-45mm-pulseira-esportiva-rosa-claro-m-g/p/237937300/te/smtw/';
  console.log(`Testando scraper Magalu (Variações) em: ${url}`);
  
  const result = await magazineluizaScraper.scrape(url);
  
  if (result) {
    console.log('--- RESULTADO ---');
    console.log(`Nome: ${result.name}`);
    console.log(`Preço: ${result.price}`);
    console.log(`Disponível: ${result.available}`);
    console.log(`Variações Encontradas: ${result.variations?.length || 0}`);
    
    if (result.variations) {
      result.variations.forEach(v => {
        console.log(` - [${v.label}] ${v.value}: ${v.available ? 'EM ESTOQUE' : 'ESGOTADO'} -> ${v.url}`);
      });
    }
  } else {
    console.error('Falha no scraping!');
  }
}

debug().catch(console.error);

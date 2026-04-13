import { shopeeScraper } from '../scrapers/shopee';
import fs from 'fs';
import path from 'path';

async function testShopee() {
  console.log('--- TESTE SHOPEE ---');
  
  const testCases = [
    {
      name: 'RTX 4060 Shopee (Lista)',
      url: 'https://shopee.com.br/search?keyword=rtx%204060',
      expectedName: 'RTX 4060'
    },
    {
      name: 'Produto Específico Shopee (Direto)',
      url: 'https://shopee.com.br/Placa-De-V%C3%ADdeo-Galax-NVIDIA-GeForce-RTX-4060-1-Click-OC-2X-8GB-GDDR6-DLSS-G-Sync-i.382025732.22276536647',
      expectedName: 'RTX 4060 Galax'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\nTestando: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    
    try {
      const result = await shopeeScraper.scrape(testCase.url, testCase.expectedName);
      console.log('Resultado:');
      console.log(JSON.stringify(result, null, 2));
      
      // Salvar HTML para análise se necessário
      // O scraper da Shopee é bem protegido, vamos ver se o Puppeteer consegue
    } catch (error) {
      console.error(`Erro ao testar ${testCase.name}:`, error);
    }
  }
}

testShopee().catch(console.error);

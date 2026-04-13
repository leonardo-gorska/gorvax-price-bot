import { SEED_PRODUCTS } from '../src/db/seed';
import { scrapeUrl } from '../src/scrapers/index';
import * as fs from 'fs';
import * as path from 'path';

async function resolveUrls() {
  console.log('🚀 Iniciando resolução de URLs do Seed...');
  
  // Filtrar apenas categorias críticas para o primeiro lote (CPUs, GPUs, Mobos)
  const priorityCategories = ['cpu', 'gpu', 'motherboard'];
  const toResolve = SEED_PRODUCTS.filter(p => 
    p.store === 'kabum' &&
    (p.url.includes('/busca') || p.url.includes('search') || p.url.includes('str=')) &&
    !p.url.includes('/produto/')
  ).slice(0, 50); 

  console.log(`📦 Encontrados ${toResolve.length} itens prioritários para resolver.`);

  const resolved = [];

  for (const product of toResolve) {
    console.log(`🔍 Resolvendo: ${product.name} na ${product.store}...`);
    try {
      const result = await scrapeUrl(product.url, product.name);
      
      if (result && result.productUrl && result.productUrl !== product.url) {
        console.log(`✅ Sucesso! URL Direta: ${result.productUrl}`);
        resolved.push({
          originalUrl: product.url,
          directUrl: result.productUrl,
          name: result.name || product.name,
          store: product.store,
          category: product.category
        });
      } else {
        console.log(`⚠️ Falha ao encontrar URL direta para: ${product.name}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${product.url}:`, error);
    }
    
    // Pequeno delay extra entre itens para segurança
    await new Promise(r => setTimeout(r, 2000));
  }

  const outputPath = path.join(process.cwd(), 'resolved_urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(resolved, null, 2));

  console.log(`\n🎉 Finalizado! ${resolved.length}/${toResolve.length} URLs resolvidas.`);
  console.log(`📄 Resultados salvos em: ${outputPath}`);
}

resolveUrls().catch(console.error);


import { initDatabase, closeDatabase } from '../src/db/index';
import { addProduct, recordPrice, applyAutoTarget, getProductById } from '../src/db/queries';
import { formatBRL } from '../src/utils/format';
import { logger } from '../src/utils/logger';

async function testAutoTarget() {
  console.log('🧪 Iniciando Teste de Auto-Target...');
  
  // 1. Inicializa DB
  initDatabase();

  try {
    // 2. Cria um produto de teste com URL única
    const timestamp = Date.now();
    const product = addProduct({
      url: `https://test.com/product-autotarget-${timestamp}`,
      store: 'kabum' as any,
      category: 'cpu' as any,
      name: 'CPU de Teste Auto-Target',
      target_price: 1000
    });

    console.log(`✅ Produto de teste criado: ID ${product.id}`);

    // 3. Insere histórico de preços (Média esperada: 1000)
    // Precisamos de pelo menos 5 pontos conforme a lógica refinada
    const prices = [1100, 900, 1050, 950, 1000];
    console.log(`📊 Inserindo histórico: ${prices.join(', ')}`);
    
    for (const p of prices) {
      recordPrice(product.id, p, true);
    }

    // 4. Aplica Auto-Target
    console.log('🎯 Aplicando applyAutoTarget...');
    const result = applyAutoTarget(product.id);

    if (!result.success) {
      console.error('❌ Falha: applyAutoTarget retornou success=false');
      process.exit(1);
    }

    // Média = 5000 / 5 = 1000. 80% = 800.
    const expectedTarget = 800;
    
    console.log(`📝 Resultado:`);
    console.log(`   Nome: ${result.name}`);
    console.log(`   Alvo Antigo: ${formatBRL(result.oldTarget || 0)}`);
    console.log(`   Novo Alvo: ${formatBRL(result.newTarget || 0)} (Esperado: ${formatBRL(expectedTarget)})`);

    // 5. Verifica no DB
    const updatedProduct = getProductById(product.id);
    if (updatedProduct?.target_price === expectedTarget) {
      console.log('✅ SUCESSO: O preço alvo no banco de dados está correto!');
    } else {
      console.error(`❌ ERRO: Preço alvo no DB (${updatedProduct?.target_price}) não corresponde ao esperado (${expectedTarget})`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

testAutoTarget();

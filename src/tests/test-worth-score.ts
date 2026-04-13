import { initDatabase, getDatabase } from '../db/index';
import { addProduct, updateProductPrice, recordPrice, getProductById, listProductsByGroupId, updateProductGroupId } from '../db/queries';
import { updateWorthScore } from '../services/worthScore';
import { logger } from '../utils/logger';

async function testWorthScore() {
  logger.info('🧪 Iniciando Testes de Worth It Score...');

  // 1. Setup - Mock Database (usando o real mas com items de teste)
  initDatabase();
  
  // Limpa possíveis resquícios de testes anteriores se necessário, 
  // mas aqui vamos apenas criar IDs únicos.
  const testGroupId = `test_group_${Date.now()}`;

  // 2. Cenário A: Produto no menor preço histórico e sem concorrência melhor
  const p1 = addProduct({
    url: `https://test.com/p1_${Date.now()}`,
    store: 'kabum',
    name: 'Teste GPU Super',
    category: 'gpu',
    group_id: testGroupId
  });
  
  logger.info({ id: p1.id }, 'Cenário A: Criado produto base');
  
  // Histórico de preços caindo
  recordPrice(p1.id, 2000);
  recordPrice(p1.id, 1900);
  recordPrice(p1.id, 1800);
  
  // Força atualização de preço e score
  updateProductPrice(p1.id, 1800, 'Teste GPU Super');
  
  // Aguarda processamento assíncrono
  await new Promise(r => setTimeout(r, 2000));
  
  let updatedP1 = getProductById(p1.id);
  logger.info({ score: updatedP1?.worth_score, price: updatedP1?.current_price }, 'Score Cenário A (Deve ser ALTO)');

  // 3. Cenário B: Produto com preço subindo e concorrente mais barato
  const p2 = addProduct({
    url: `https://test.com/p2_${Date.now()}`,
    store: 'pichau',
    name: 'Teste GPU Super',
    category: 'gpu',
    group_id: testGroupId
  });
  
  // Preço do concorrente bem mais baixo que o p1 (fazendo o p1 parecer ruim)
  updateProductPrice(p2.id, 1500, 'Teste GPU Super');
  
  // Atualiza o p1 para um preço MAIOR
  updateProductPrice(p1.id, 2500, 'Teste GPU Super');
  
  await new Promise(r => setTimeout(r, 2000));
  
  updatedP1 = getProductById(p1.id);
  logger.info({ score: updatedP1?.worth_score, price: updatedP1?.current_price }, 'Score Cenário B (Deve ser BAIXO para o P1)');

  if (updatedP1 && updatedP1.worth_score != null) {
    logger.info('✅ Teste de Worth It Score FINALIZADO: Valores de pontuação capturados.');
  } else {
    logger.warn('⚠️ Teste de Worth It Score ainda não capturou a pontuação assíncrona');
  }

  process.exit(0);
}

testWorthScore().catch(err => {
  console.error(err);
  process.exit(1);
});

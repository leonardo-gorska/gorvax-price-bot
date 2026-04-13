import { initDatabase, getDatabase } from '../db/index';
import { addProduct, updateProductPrice } from '../db/queries';
import { calculatePricePrediction } from '../services/prediction';
import { logger } from '../utils/logger';

async function testPrediction() {
  logger.info('🧪 Iniciando Testes de Predição IA...');
  initDatabase();
  const db = getDatabase();

  const id = Date.now();
  const p = addProduct({
    url: `https://test.com/pred_${id}`,
    store: 'amazon',
    name: 'GPU Teste Predição',
    category: 'gpu'
  });

  // Limpa histórico anterior para este ID
  db.prepare('DELETE FROM price_history WHERE product_id = ?').run(p.id);

  // Cenário 1: Tendência de Queda (Linear)
  logger.info('📉 Cenário 1: Tendência de Queda');
  const insertHistory = db.prepare('INSERT INTO price_history (product_id, price, checked_at) VALUES (?, ?, ?)');
  
  const now = new Date();
  for (let i = 10; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().replace('T', ' ').substring(0, 19);
    const price = 2000 - (10 - i) * 100; // 2000, 1900, ..., 1100
    insertHistory.run(p.id, price, dateStr);
  }

  // Preço atual
  updateProductPrice(p.id, 1000, 'GPU Teste Predição');

  const pred = calculatePricePrediction(p.id);
  logger.info({ 
    current: pred?.currentPrice, 
    predicted: pred?.predictedPrice7d, 
    trend: pred?.trend,
    confidence: pred?.confidence 
  }, 'Resultado da Predição (Queda)');

  if (pred && pred.trend === 'down' && pred.predictedPrice7d < 1000) {
    logger.info('✅ Teste de Queda: SUCESSO');
  } else {
    logger.error('❌ Teste de Queda: FALHA');
  }

  // Cenário 2: Tendência de Alta
  logger.info('📈 Cenário 2: Tendência de Alta');
  db.prepare('DELETE FROM price_history WHERE product_id = ?').run(p.id);
  for (let i = 10; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().replace('T', ' ').substring(0, 19);
    const price = 1000 + (10 - i) * 100; // 1000, 1100, ..., 1900
    insertHistory.run(p.id, price, dateStr);
  }
  updateProductPrice(p.id, 2000, 'GPU Teste Predição');

  const predUp = calculatePricePrediction(p.id);
  logger.info({ 
    current: predUp?.currentPrice, 
    predicted: predUp?.predictedPrice7d, 
    trend: predUp?.trend,
    confidence: predUp?.confidence 
  }, 'Resultado da Predição (Alta)');

  if (predUp && predUp.trend === 'up' && predUp.predictedPrice7d > 2000) {
    logger.info('✅ Teste de Alta: SUCESSO');
  } else {
    logger.error('❌ Teste de Alta: FALHA');
  }

  process.exit(0);
}

testPrediction().catch(err => {
  console.error(err);
  process.exit(1);
});

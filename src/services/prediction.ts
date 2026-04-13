import * as ss from 'simple-statistics';
import { getTrendData, getProductById } from '../db/queries';
import { logger } from '../utils/logger';

export interface PredictionResult {
  currentPrice: number;
  predictedPrice7d: number;
  confidence: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  points: number;
}

/**
 * Calcula a previsão de preço para os próximos 7 dias usando Regressão Linear.
 * 
 * @param productId ID do produto no banco
 * @returns PredictionResult ou null se não houver dados suficientes
 */
export function calculatePricePrediction(productId: number): PredictionResult | null {
  try {
    const product = getProductById(productId);
    if (!product || product.current_price == null) return null;

    // Busca histórico (últimos 30 dias de pontos)
    const history = getTrendData(productId);
    
    // Precisamos de pelo menos 5 pontos para uma predição minimamente séria
    if (history.length < 5) {
      logger.debug({ productId, points: history.length }, '🔍 Dados insuficientes para predição ML');
      return null;
    }

    // Prepara os dados: [timestamp, price]
    // Usamos timestamps em dias para evitar números gigantescos na regressão
    const startTime = new Date(history[0].checked_at).getTime();
    const data = history.map(p => {
      const x = (new Date(p.checked_at).getTime() - startTime) / (1000 * 60 * 60 * 24);
      return [x, p.price];
    });

    // Adiciona o preço atual como o ponto mais recente
    const nowX = (Date.now() - startTime) / (1000 * 60 * 60 * 24);
    data.push([nowX, product.current_price]);

    // Executa a Regressão Linear: y = mx + b
    const regression = ss.linearRegression(data);
    const line = ss.linearRegressionLine(regression);

    // Predição para daqui a 7 dias
    const targetX = nowX + 7;
    const predictedPrice7d = Math.max(0, Math.round(line(targetX)));

    // Cálculo de Confiança (R-Squared / Coeficiente de Determinação)
    // R² indica quão bem a linha se ajusta aos dados (0 a 1)
    let rSquared = 0;
    try {
      rSquared = ss.sampleCorrelation(data.map(d => d[0]), data.map(d => d[1])) ** 2;
    } catch (e) {
      rSquared = 0.1; // Fallback para dados muito erráticos
    }

    // Ajuste de confiança baseado na quantidade de pontos e no R²
    // Requisito do roadmap: "3+ meses" (estimamos ~90 pontos se 1/dia)
    const pointWeight = Math.min(history.length / 30, 1.0); // Máximo peso aos 30 pontos
    const confidence = Math.round(rSquared * 100 * pointWeight);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    const slope = regression.m; // m > 0 (subindo), m < 0 (caindo)
    
    // Consideramos estável se a variação predita for < 1% do preço atual
    const predictedChange = Math.abs(predictedPrice7d - product.current_price) / product.current_price;
    if (predictedChange < 0.01) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'up';
    } else {
      trend = 'down';
    }

    return {
      currentPrice: product.current_price,
      predictedPrice7d,
      confidence,
      trend,
      points: history.length
    };
  } catch (err: any) {
    logger.error({ productId, error: err.message }, '❌ Falha ao calcular predição de preço');
    return null;
  }
}

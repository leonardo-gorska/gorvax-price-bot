import { getProductById, getPriceHistory, listProductsByGroupId, setWorthScore } from '../db/queries';
import { logger } from '../utils/logger';

/**
 * Calcula e atualiza o Worth It Score de um produto.
 * 0-100 (Quanto maior, melhor o negócio)
 */
export async function updateWorthScore(productId: number): Promise<number | null> {
  try {
    const product = getProductById(productId);
    if (!product || product.current_price == null) return null;

    let score = 0;
    const currentPrice = product.current_price;

    // 1. Preço vs Mínimo Histórico (Peso: 40%)
    if (product.lowest_price != null && product.lowest_price > 0) {
      const priceVsLowest = (product.lowest_price / currentPrice) * 40;
      score += Math.min(40, priceVsLowest);
    } else {
      score += 20; // Default neutro se não houver histórico
    }

    // 2. Tendência (Peso: 20%)
    const history = getPriceHistory(productId, 6);
    if (history.length >= 4) {
      const prices = history.map(h => h.price);
      const half = Math.floor(prices.length / 2);
      const recent = prices.slice(0, half);
      const older = prices.slice(half);
      
      const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
      const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;

      if (avgRecent < avgOlder) {
        score += 20; // Preço caindo
      } else if (avgRecent === avgOlder) {
        score += 10; // Estável
      }
    } else {
      score += 10; // Sem dados suficientes para tendência
    }

    // 3. Comparação Cruzada (Peso: 30%)
    if (product.group_id) {
      const groupProducts = listProductsByGroupId(product.group_id);
      const validPrices = groupProducts
        .map(p => p.current_price)
        .filter((p): p is number => p != null && p > 0);

      if (validPrices.length > 1) {
        const minPrice = Math.min(...validPrices);
        const crossStoreScore = (minPrice / currentPrice) * 30;
        score += Math.min(30, crossStoreScore);
      } else {
        score += 15; // Único no grupo
      }
    } else {
      score += 15; // Sem grupo para comparar
    }

    // 4. Disponibilidade (Peso: 10%)
    if (product.last_available === 1) {
      score += 10;
    }

    const finalScore = Math.round(score);
    setWorthScore(productId, finalScore);
    
    logger.debug({ productId, score: finalScore }, 'Worth It Score atualizado');
    return finalScore;
  } catch (err: any) {
    logger.error({ productId, error: err.message }, 'Erro ao calcular Worth It Score');
    return null;
  }
}

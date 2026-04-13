// ============================================
// Utils — Matemática e Estatística
// ============================================

/**
 * Calcula a Média Móvel Simples (SMA) para um conjunto de dados.
 * @param data Array de números (preços)
 * @param window Tamanho da janela (ex: 7 para 7 dias)
 * @returns Array de médias (mesmo tamanho do original, com null no início se necessário)
 */
export function calculateSMA(data: number[], window: number): (number | null)[] {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(null);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < window; j++) {
      sum += data[i - j];
    }
    result.push(Number((sum / window).toFixed(2)));
  }
  
  return result;
}

/**
 * Calcula a mediana de um conjunto de números.
 * Mais robusto que a média simples para detectar outliers.
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);

  if (sorted.length % 2) {
    return sorted[half];
  }

  return (sorted[half - 1] + sorted[half]) / 2.0;
}

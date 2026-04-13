// ============================================
// Formatação — Moeda, datas, emojis
// ============================================

/** Formata valor em Reais: R$ 1.234,56 */
export function formatBRL(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Formata data ISO para dd/mm/yyyy HH:mm */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Nunca';
  const d = new Date(isoDate);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Emoji de variação de preço */
export function priceChangeEmoji(oldPrice: number, newPrice: number): string {
  if (newPrice < oldPrice) return '📉';
  if (newPrice > oldPrice) return '📈';
  return '➡️';
}

/** Emoji da categoria */
export function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    cpu: '🧠',
    gpu: '🎮',
    motherboard: '🔌',
    ram1x16: '💾',
    ram2x16: '💾',
    ssd: '💿',
    nvme: '⚡',
    psu: '🔋',
    case: '🖥️',
    cooler: '❄️',
    monitor: '🖵',
    mouse: '🖱️',
    keyboard: '⌨️',
    headset: '🎧',
    mousepad: '⏹️',
    wifi_adapter: '📶',
    webcam: '📷',
    microphone: '🎤',
    peripheral: '⌨️',
    chair: '💺',
    other: '📦',
  };
  return map[category] || '📦';
}

/** Emoji da loja */
export function storeEmoji(store: string): string {
  const map: Record<string, string> = {
    kabum: '🟠 📦',
    pichau: '🔵 🛍️',
    terabyte: '🟢 🖥️',
    amazon: '🟡 🛒',
    mercadolivre: '🟣 🤝',
    magazineluiza: '🔴 👗',
    aliexpress: '🌏 📦',
    shopee: '🟠 🛍️',
    gkinfostore: '🔵 ⚡',
  };
  return map[store] || '⚪ ❓';
}

/** Calcula porcentagem de desconto */
export function discountPercent(original: number, current: number): string {
  if (original <= 0 || current >= original) return '';
  const pct = ((original - current) / original) * 100;
  return `-${pct.toFixed(0)}%`;
}

/** Detecta a loja a partir de uma URL */
export function detectStore(url: string): string | null {
  const lower = url.toLowerCase();
  if (lower.includes('kabum.com.br')) return 'kabum';
  if (lower.includes('pichau.com.br')) return 'pichau';
  if (lower.includes('terabyte') || lower.includes('terabyteshop')) return 'terabyte';
  if (lower.includes('amazon.com.br')) return 'amazon';
  if (lower.includes('mercadolivre.com.br') || lower.includes('produto.mercadolivre')) return 'mercadolivre';
  if (lower.includes('magazineluiza.com.br') || lower.includes('magalu.com')) return 'magazineluiza';
  if (lower.includes('aliexpress.com')) return 'aliexpress';
  if (lower.includes('shopee.com.br')) return 'shopee';
  if (lower.includes('gkinfostore.com.br')) return 'gkinfostore';
  return null;
}

/** Detecta se o título indica um Kit ou Combo */
export function isKit(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return (
    lower.includes('kit ') ||
    lower.includes(' combo ') ||
    lower.includes(' combo') ||
    lower.startsWith('combo ') ||
    /\b(2x|4x|kit|combo)\b/.test(lower) ||
    lower.includes('pente de memória') ||
    lower.includes('pentes de memória')
  );
}
/** Emoji e descrição de Worth It Score (Fase 10.3) */
export function worthScoreEmoji(score: number | null | undefined): string {
  if (score == null) return 'N/A';
  if (score >= 90) return `💎 ${score}/100`;
  if (score >= 70) return `✅ ${score}/100`;
  if (score >= 50) return `🟡 ${score}/100`;
  return `⚠️ ${score}/100`;
}

/** Formata o resultado da predição para o usuário (Fase 10.2) */
export function formatPrediction(prediction: {
  predictedPrice7d: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}): string {
  const { predictedPrice7d, confidence, trend } = prediction;
  
  const trendEmoji = trend === 'down' ? '📉' : trend === 'up' ? '📈' : '➡️';
  const confidenceEmoji = confidence >= 80 ? '🟢' : confidence >= 50 ? '🟡' : '🔴';
  const confidenceText = confidence >= 80 ? 'Alta' : confidence >= 50 ? 'Média' : 'Baixa';

  let recommendation = '';
  if (trend === 'down' && confidence >= 50) {
    recommendation = '\n\n💡 *Dica:* Tendência de queda. Talvez valha a pena esperar alguns dias! ⏳';
  } else if (trend === 'up' && confidence >= 50) {
    recommendation = '\n\n💡 *Dica:* Tendência de alta detectada. Compre logo antes que suba mais! 🛒';
  } else if (trend === 'stable' && confidence >= 70) {
    recommendation = '\n\n💡 *Dica:* Preço estável. Bom momento para comprar se estiver no seu alvo. ✅';
  }

  return (
    `🔮 *Previsão IA (Beta)*\n` +
    `${trendEmoji} Tendência: ${trend === 'down' ? 'Queda' : trend === 'up' ? 'Alta' : 'Estável'}\n` +
    `💰 Expectativa (7 dias): *${formatBRL(predictedPrice7d)}*\n` +
    `🎯 Confiança: ${confidenceEmoji} ${confidence}% (${confidenceText})${recommendation}`
  );
}

/** Retorna o uso de memória formatado */
export function getMemoryUsage(): string {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  return `${used.toFixed(2)} MB`;
}

/** Escapa caracteres especiais para o Telegram Markdown (V1) */
export function escapeMarkdown(text: string | null | undefined): string {
  if (!text) return '';
  // No Markdown V1 do Telegram, precisamos escapar: _ * [ `
  return text.replace(/[_*[`]/g, '\\$&');
}

import { formatBRL, categoryEmoji, storeEmoji, isKit, escapeMarkdown } from '../utils/format';
import type { Product, ScrapeResult, TrendInfo, AlertData, GenericCoupon } from '../types';
import { calculateDiscountedPrice } from '../utils/coupons';
import { alertActionsKeyboard } from '../bot/keyboards';
import { calculatePricePrediction } from '../services/prediction';

/**
 * Avalia as mudanças de preço e gera os alertas apropriados.
 * Segue a lógica de prioridades da Fase 4.1 e 4.2 do Roadmap.
 */
export function evaluateAlerts(
  product: Product,
  result: ScrapeResult,
  chartImageUrl?: string | null,
  trend?: TrendInfo,
  isNewCoupon?: boolean, // Do scraping da página do produto
  matchingCoupon?: GenericCoupon // Do hub de cupons (genérico)
): AlertData[] {
  const alerts: AlertData[] = [];
  const oldPrice = product.current_price;
  const wasUnavailable = product.last_available === 0;

  // Preço base para cálculos de alerta (prioriza o preço com cupom se disponível)
  const basePrice = result.price || 0;
  const finalPrice = matchingCoupon 
    ? calculateDiscountedPrice(basePrice, matchingCoupon)
    : basePrice;

  const isLowest = product.lowest_price == null || (finalPrice > 0 && finalPrice < product.lowest_price);
  const dropPercent = oldPrice != null && finalPrice > 0 && finalPrice < oldPrice 
    ? ((oldPrice - finalPrice) / oldPrice) * 100 
    : 0;
  
  const kitBadge = isKit(result.name) ? ' 📦 *[KIT/COMBO]*' : '';

  // Texto do cupom (se houver)
  const couponText = matchingCoupon 
    ? `\n🎟️ *Com cupom:* *${formatBRL(finalPrice)}* (Cupom: \`${matchingCoupon.code}\`)`
    : (result.coupon ? `\n🏷️ \`CUPOM: ${result.coupon}\`` : '');

  // Indicadores de Tendência (Fase 4.2)
  let trendText = '';
  if (trend) {
    if (trend.isLowestStable) {
      trendText = '\n🔥 *Preço estável no mínimo histórico há > 48h!*';
    } else if (trend.direction === 'down') {
      trendText = `\n📉 *Trajetória de baixa! (${trend.changePercent.toFixed(0)}% vs média 30d)*`;
    } else if (trend.direction === 'up' && dropPercent < 5) {
      // Só avisa que está subindo se não for um alerta de queda (contradição)
      trendText = '\n⚠️ *Tendência de alta detectada no período.*';
    }
  }

  // Inteligência de Predição (Fase 10.2)
  const prediction = calculatePricePrediction(product.id);
  const predictionText = prediction 
    ? `\n🔮 *Predição (7d):* *${formatBRL(prediction.predictedPrice7d)}* (Confiança: ${prediction.confidence}%)`
    : '';

  // Worth It Score (Fase 10.3)
  const worthScoreText = product.worth_score != null
    ? `\n💎 *Worth It Score:* *${product.worth_score}/100*`
    : '';

  const intelligenceText = predictionText + worthScoreText;

  if (result.price == null) return [];

  // 1. Alerta de Restock (Prioridade: Alta)
  if (wasUnavailable && result.available) {
    alerts.push({
      text: `🔄 *PRODUTO VOLTOU AO ESTOQUE!*${kitBadge}\n` +
      `${categoryEmoji(product.category)} *${escapeMarkdown(result.name || product.name)}*\n` +
      `${storeEmoji(product.store)} ${escapeMarkdown(product.store)}\n` +
      `💰 *${formatBRL(basePrice)}*` + couponText + '\n' +
      trendText + intelligenceText + '\n' +
      `🔗 ${product.url}`,
      imageUrl: result.imageUrl,
      productId: product.id,
      priority: 'high'
    });
  }

  // 2. PREÇO ALVO ATINGIDO! (Prioridade: Alta)
  if (product.target_price && result.price <= product.target_price) {
    alerts.push({
      text: `🎯 *[ALVO ALCANÇADO]*${kitBadge}\n` +
      `${categoryEmoji(product.category)} *${escapeMarkdown(result.name || product.name)}*\n` +
      `${storeEmoji(product.store)} ${escapeMarkdown(product.store)}\n` +
      `💰 *${formatBRL(basePrice)}* (alvo: ${formatBRL(product.target_price)})` + couponText + '\n' +
      trendText + intelligenceText + '\n' +
      `🔗 ${product.url}`,
      imageUrl: result.imageUrl,
      productId: product.id,
      priority: 'high'
    });
  }

  // 3. MENOR PREÇO HISTÓRICO! (Prioridade: Alta)
  else if (isLowest && result.price > 0) {
    alerts.push({
      text: `💎 *[OPORTUNIDADE]* — Menor Preço Histórico!${kitBadge}\n` +
      `${categoryEmoji(product.category)} *${escapeMarkdown(result.name || product.name)}*\n` +
      `${storeEmoji(product.store)} ${escapeMarkdown(product.store)}\n` +
      `💰 *${formatBRL(basePrice)}* (queda recorde!)` + couponText + '\n' +
      trendText + intelligenceText + '\n' +
      `🔗 ${product.url}`,
      imageUrl: result.imageUrl,
      productId: product.id,
      priority: 'high'
    });
  }

  // 4. QUEDA BRUTA (> 10%) (Prioridade: Alta)
  else if (dropPercent >= 10) {
    alerts.push({
      text: `💥 *[OPORTUNIDADE]* — Queda Bruta (${dropPercent.toFixed(0)}%)${kitBadge}\n` +
      `${categoryEmoji(product.category)} *${escapeMarkdown(result.name || product.name)}*\n` +
      `${storeEmoji(product.store)} ${escapeMarkdown(product.store)}\n` +
      `De: ${formatBRL(oldPrice!)} → *${formatBRL(basePrice)}*` + couponText + '\n' +
      trendText + intelligenceText + '\n' +
      `🔗 ${product.url}`,
      imageUrl: result.imageUrl,
      productId: product.id,
      priority: 'high'
    });
  }

  // 5. NOVO CUPOM DETECTADO (Prioridade: Alta)
  if (isNewCoupon && result.coupon) {
    alerts.push({
      text: `🎟️ *[OPORTUNIDADE]* — Novo Cupom!${kitBadge}\n` +
      `${categoryEmoji(product.category)} *${escapeMarkdown(result.name || product.name)}*\n` +
      `${storeEmoji(product.store)} ${escapeMarkdown(product.store)}\n` +
      `💰 Preço: *${formatBRL(basePrice)}*\n` +
      `🔥 \`CUPOM: ${result.coupon}\`\n` +
      trendText + intelligenceText + '\n' +
      `🔗 ${product.url}`,
      imageUrl: result.imageUrl,
      productId: product.id,
      priority: 'high'
    });
  }

  // 6. Queda de Preço ou Novo Cupom Aplicável (Prioridade: Normal)
  else if (dropPercent >= (product.alert_percent || 3)) {
    const sitePriceChanged = oldPrice != null && basePrice < oldPrice;
    const hasDiscount = finalPrice < basePrice;
    
    let alertTitle = '📈 *Variante de Preço Detectada*';
    let comparisonLine = '';

    if (sitePriceChanged && !hasDiscount) {
      alertTitle = '📉 *Queda de Preço no Site!*';
      comparisonLine = `De: ${formatBRL(oldPrice!)} → *${formatBRL(basePrice)}* (\\-${dropPercent.toFixed(0)}%)\n`;
    } else if (!sitePriceChanged && hasDiscount) {
      alertTitle = '🎟️ *Desconto via Cupom Disponível!*';
      comparisonLine = `Preço: *${formatBRL(basePrice)}* → *${formatBRL(finalPrice)}* com cupom (\\-${dropPercent.toFixed(0)}%)\n`;
    } else if (sitePriceChanged && hasDiscount) {
      alertTitle = '💥 *Super Oferta: Queda + Cupom!*';
      comparisonLine = `De: ${formatBRL(oldPrice!)} → *${formatBRL(finalPrice)}* total (\\-${dropPercent.toFixed(0)}%)\n`;
    }

    alerts.push({
      text: `${alertTitle}${kitBadge}\n` +
      `${categoryEmoji(product.category)} *${escapeMarkdown(result.name || product.name)}*\n` +
      `${storeEmoji(product.store)} ${escapeMarkdown(product.store)}\n` +
      comparisonLine + couponText + '\n' +
      trendText + intelligenceText + '\n' +
      `🔗 ${product.url}`,
      imageUrl: chartImageUrl || result.imageUrl,
      productId: product.id,
      priority: 'normal'
    });
  }

  // Adiciona botões interativos a todos os alertas (Fase 7.5)
  alerts.forEach(a => {
    a.replyMarkup = alertActionsKeyboard(product.id, product.url);
  });

  return alerts;
}

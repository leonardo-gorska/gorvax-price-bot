// ============================================
// Confidence — Score de confiança do scraping
// ============================================

import { logger } from './logger';

/** Calcula similaridade entre duas strings (Sørensen–Dice coefficient) */
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const normalize = (str: string) => 
    str.toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/placa de video|processador|monitor|gabinete|computador|pc gamer|pc|combo|kit|completo|oficial/gi, "")
       .replace(/[^a-z0-9]/g, " ")
       .replace(/\s+/g, " ")
       .trim();
  const aLow = normalize(a);
  const bLow = normalize(b);
  if (aLow === bLow) return 1;
  if (aLow === "" || bLow === "") return 0;

  // Se uma string for subtring da outra, bonifica
  // Mas se a diferença de tamanho for extrema, o bônus é reduzido
  let substringBonus = 0;
  if (aLow.includes(bLow) || bLow.includes(aLow)) {
    const ratio = Math.min(aLow.length, bLow.length) / Math.max(aLow.length, bLow.length);
    substringBonus = ratio > 0.1 ? 0.4 : 0.1;
  }

  const bigrams = (s: string): Set<string> => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.substring(i, i + 2));
    }
    return set;
  };

  const aBi = bigrams(aLow);
  const bBi = bigrams(bLow);
  let intersection = 0;
  for (const bi of aBi) {
    if (bBi.has(bi)) intersection++;
  }

  const dice = (2 * intersection) / (aBi.size + bBi.size);
  let totalScore = dice + substringBonus;

  // Penalização por divergência numérica (CRÍTICO para hardware)
  // Se houver um número no esperado que não existe no encontrado, penaliza fortemente
  const extractNumbers = (s: string): string[] => (s.match(/\d+/g) || []) as string[];
  const aNums = extractNumbers(aLow);
  const bNums = extractNumbers(bLow);

  for (const n of bNums) {
    if (!aNums.includes(n)) {
      totalScore -= 0.3; // Penaliza 30% por número faltante
    }
  }

  return Math.max(0, Math.min(1, totalScore));
}

/**
 * Verifica se um produto é relevante para a busca.
 * Combina similaridade de string com filtros de hardware específicos.
 */
export function isProductRelevant(scrapedName: string, expectedName: string, threshold = 0.45): boolean {
  if (!scrapedName || !expectedName) return false;
  
  const nameLower = scrapedName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const expectedLower = expectedName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Filtro Rigoroso de Chipset (Placas-mãe)
  const chipsets = ['b450', 'b550', 'b650', 'x570', 'x670', 'z690', 'z790', 'h610', 'a520', 'a620', 'h510', 'b560', 'b660'];
  const expectedChipset = chipsets.find(c => expectedLower.includes(c));
  if (expectedChipset) {
    const foundChipset = chipsets.find(c => nameLower.includes(c));
    if (foundChipset && foundChipset !== expectedChipset) {
      logger.debug({ scrapedName, expectedChipset, foundChipset }, 'Relevância: Conflito de chipset detectado');
      return false;
    }
  }

  // 2. Filtro de Modelos Numéricos (GPUs/CPUs)
  // Se o esperado tem "4060", o título não pode ter "3060", "4070", etc.
  const modelMatch = expectedLower.match(/\d{4}/);
  if (modelMatch) {
    const expectedModel = modelMatch[0];
    const foundModels: string[] = nameLower.match(/\d{4}/g) || [];
    // Se encontrou modelos de 4 dígitos e nenhum é o esperado, descarta
    if (foundModels.length > 0 && !foundModels.includes(expectedModel)) {
      logger.debug({ scrapedName, expectedModel, foundModels }, 'Relevância: Conflito de modelo numérico');
      return false;
    }
  }

  // 3. Keywords Negativas (Evitar PCs completos em buscas de peças)
  const negativeKeywords = [
    'pc gamer completo', 'computador montado', 'configuracao', 
    'certificado', 'adesivo', 'camiseta', 'caneca', 'kit upgrade'
  ];

  const isExpectedPC = expectedLower.includes('pc gamer') || expectedLower.includes('computador');
  const hasNegative = negativeKeywords.some(kw => 
    nameLower.includes(kw) && !expectedLower.includes(kw)
  );
  
  // Se não estamos buscando um PC completo e o resultado parece um, descarta
  if (!isExpectedPC && hasNegative) return false;

  // 4. Score de Similaridade de String
  const score = stringSimilarity(scrapedName, expectedName);
  
  return score >= threshold;
}

export interface ConfidenceResult {
  score: number;       // 0-100
  reasons: string[];
  isReliable: boolean; // score >= 40
}

/**
 * Avalia a confiança de um resultado de scraping.
 * Verifica:
 * - Similaridade do nome do produto scrapeado vs esperado
 * - Variação de preço vs último preço (rejeita >50%)
 * - Se o preço é plausível (ex: > R$ 5 e < R$ 100.000)
 */
export function evaluateConfidence(
  scrapedName: string | null,
  expectedName: string | null,
  scrapedPrice: number | null,
  lastKnownPrice: number | null,
): ConfidenceResult {
  const reasons: string[] = [];
  let score = 100; // Começa perfeito, vai perdendo pontos

  // Penaliza nomes genéricos de fallback (indicam falha de extração)
  if (scrapedName && /^Produto\s+(Kabum|Pichau|Terabyte|Amazon|Mercado|Magazine)/i.test(scrapedName.trim())) {
    score -= 40;
    reasons.push('❌ Nome genérico (falha de extração do scraper)');
  }

  // 1. Validar nome
  if (scrapedName && expectedName) {
    const similarity = stringSimilarity(scrapedName, expectedName);

    if (similarity >= 0.5) {
      reasons.push(`✅ Nome compatível (${Math.round(similarity * 100)}%)`);
    } else if (similarity >= 0.3) {
      score -= 25;
      reasons.push(`⚠️ Nome parcialmente compatível (${Math.round(similarity * 100)}%)`);
    } else {
      score -= 50;
      reasons.push(`❌ Nome muito diferente (${Math.round(similarity * 100)}%): "${scrapedName?.substring(0, 50)}"`);
    }
  } else if (!scrapedName) {
    score -= 20;
    reasons.push('⚠️ Nome não encontrado no scraping');
  }

  // 2. Validar variação de preço
  if (scrapedPrice != null && lastKnownPrice != null && lastKnownPrice > 0) {
    const variation = Math.abs(scrapedPrice - lastKnownPrice) / lastKnownPrice;

    if (variation > 0.5) {
      score -= 60;
      reasons.push(`❌ Variação de preço > 50% (${Math.round(variation * 100)}%)`);
    } else if (variation > 0.3) {
      score -= 15;
      reasons.push(`⚠️ Variação de preço moderada (${Math.round(variation * 100)}%)`);
    }
  }

  // 3. Preço plausível
  if (scrapedPrice != null) {
    if (scrapedPrice < 5) {
      score -= 30;
      reasons.push(`❌ Preço suspeitamente baixo: R$ ${scrapedPrice}`);
    } else if (scrapedPrice > 100_000) {
      score -= 30;
      reasons.push(`❌ Preço suspeitamente alto: R$ ${scrapedPrice}`);
    }
  } else {
    score -= 30;
    reasons.push('⚠️ Preço não encontrado');
  }

  score = Math.max(0, Math.min(100, score));
  const isReliable = score >= 50;

  if (!isReliable) {
    logger.warn(
      { score, scrapedName: scrapedName?.substring(0, 60), expectedName: expectedName?.substring(0, 60), scrapedPrice, lastKnownPrice },
      '🔍 Scraping com baixa confiança'
    );
  }

  return { score, reasons, isReliable };
}

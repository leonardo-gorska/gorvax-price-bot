import { ProductCategory } from '../types';

/**
 * Categorizador Avançado baseado em Regex.
 * Prioriza itens de hardware específicos e evita ambiguidades.
 */

interface CategoryRule {
  category: ProductCategory;
  patterns: RegExp[];
  negPatterns?: RegExp[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'gpu',
    patterns: [
      /\b(rtx|gtx|radeon|geforce|arc)\b/i,
      /\b(rx)\s?\d{3,4}/i,
      /\b(nvidi[aa]|amd|intel)\b.*\bvideo\s?card\b/i
    ],
    negPatterns: [/\b(kit|upgrade|combo)\b/i]
  },
  {
    category: 'cpu',
    patterns: [
      /\b(ryzen|intel core|core i[3579])\b/i,
      /\b(processador)\b/i
    ],
    negPatterns: [/\bcooler\b/i, /\bplaca-mae\b/i, /\bkit\b/i]
  },
  {
    category: 'motherboard',
    patterns: [
      /\b(placa-mae|placa mae|motherboard)\b/i,
      /\b(b450|b550|b650|z690|z790|h610|a520|a620|h510|b560|b660)\b/i
    ],
    negPatterns: [/\bkit\b/i, /\bcombo\b/i, /\bprocessador\b/i]
  },
  {
    category: 'ram1x16',
    patterns: [
      /\b(1x16gb|1x 16gb)\b/i,
      /\b(memoria|ram)\b.*\b16gb\b(?!.*\b2x\b)/i
    ]
  },
  {
    category: 'ram2x16',
    patterns: [
      /\b(2x16gb|2x 16gb|kit 32gb)\b/i,
      /\b(memoria|ram)\b.*\b32gb\b.*\b(2x|kit)\b/i
    ]
  },
  {
    category: 'ram',
    patterns: [
      /\b(memoria ram|ddr4|ddr5|so-dimm|sodimm)\b/i,
      /\b(8gb|16gb|32gb|64gb)\b/i
    ]
  },
  {
    category: 'nvme',
    patterns: [
      /\b(nvme|m\.2|m2|pcie gen\d)\b/i
    ]
  },
  {
    category: 'ssd',
    patterns: [
      /\b(ssd)\b/i,
      /\b(sata)\b.*\b(240gb|480gb|960gb|1tb|2tb)\b/i
    ]
  },
  {
    category: 'psu',
    patterns: [
      /\b(fonte)\b.*\b(\d{3,4}w|80 plus|modular)\b/i,
      /\b(psu)\b/i
    ]
  },
  {
    category: 'monitor',
    patterns: [
      /\b(monitor|tela)\b/i,
      /\b(144hz|165hz|240hz|curvo|ultrawide)\b/i
    ]
  },
  {
    category: 'case',
    patterns: [
      /\b(gabinete|tower|mid-tower|full-tower|micro-atx|atx)\b/i
    ],
    negPatterns: [/\bkit\b/i]
  },
  {
    category: 'mouse',
    patterns: [/\b(mouse)\b/i]
  },
  {
    category: 'keyboard',
    patterns: [/\b(teclado|keyboard)\b/i]
  },
  {
    category: 'cooler',
    patterns: [
      /\b(cooler|water cooler|air cooler|fan|ventoinha|dissipador)\b/i
    ]
  }
];

export function guessCategory(name: string): ProductCategory {
  const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const rule of CATEGORY_RULES) {
    const isMatch = rule.patterns.some(pattern => pattern.test(normalized));
    if (isMatch) {
      const isNegMatch = rule.negPatterns?.some(pattern => pattern.test(normalized));
      if (!isNegMatch) {
        return rule.category;
      }
    }
  }

  return 'other';
}

import { listAllActiveProducts } from '../db/queries';
import type { Product } from '../types';

interface BuildResult {
  totalPrice: number;
  components: Array<{
    category: string;
    product: Product;
    price: number;
  }>;
}

const BUILD_CATEGORIES = ['cpu', 'gpu', 'ram', 'ssd', 'motherboard', 'psu', 'case'] as const;

/**
 * Seleciona os melhores componentes monitorados para montar uma build.
 * Estrategia: menor preco por categoria entre os produtos ativos.
 */
export function solveBuild(strategy: 'recommended' | 'budget' | 'performance' = 'recommended'): BuildResult | null {
  const products = listAllActiveProducts();
  if (products.length === 0) return null;

  const components: BuildResult['components'] = [];

  for (const cat of BUILD_CATEGORIES) {
    const candidates = products.filter(
      (p) => p.category === cat && p.current_price != null && p.active
    );

    if (candidates.length === 0) continue;

    candidates.sort((a, b) => {
      if (strategy === 'budget') return (a.current_price ?? Infinity) - (b.current_price ?? Infinity);
      if (strategy === 'performance') return (b.current_price ?? 0) - (a.current_price ?? 0);
      // recommended: menor preco
      return (a.current_price ?? Infinity) - (b.current_price ?? Infinity);
    });

    const best = candidates[0];
    components.push({
      category: cat,
      product: best,
      price: best.current_price ?? 0,
    });
  }

  if (components.length === 0) return null;

  return {
    totalPrice: components.reduce((sum, c) => sum + c.price, 0),
    components,
  };
}

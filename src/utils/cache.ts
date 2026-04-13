/**
 * Um cache LRU (Least Recently Used) simples com suporte a TTL (Time To Live).
 */
export class SimpleLRUCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  private readonly max_size: number;
  private readonly default_ttl_ms: number;

  constructor(max_size: number = 100, default_ttl_ms: number = 15 * 60 * 1000) {
    this.max_size = max_size;
    this.default_ttl_ms = default_ttl_ms;
  }

  set(key: string, value: T, ttl_ms: number = this.default_ttl_ms): void {
    if (this.cache.size >= this.max_size) {
      // Remove o item mais antigo (primeira chave no Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    // Deleta e reinseri para mover para o final (mais recente)
    this.cache.delete(key);
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl_ms,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    // Refresh na posição do item (move para o final)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const scrapeCache = new SimpleLRUCache<any>(200, 15 * 60 * 1000); // 15 min cache

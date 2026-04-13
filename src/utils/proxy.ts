// ============================================
// Proxy Manager — Rotação de Proxies (Round-Robin)
// ============================================

import { logger } from './logger';
import { getConfig } from '../config';

export class ProxyManager {
  private proxies: string[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.loadProxies();
  }

  /** Carrega proxies da configuração (.env) */
  private loadProxies(): void {
    const config = getConfig() || {};
    const list = config.PROXY_LIST;
    const single = config.PROXY_URL;

    if (list) {
      this.proxies = list.split(',').map(p => p.trim()).filter(Boolean);
      logger.info({ count: this.proxies.length }, '🌐 ProxyManager: Lista de proxies carregada');
    } else if (single) {
      this.proxies = [single];
      logger.info('🌐 ProxyManager: Proxy único configurado');
    } else {
      logger.debug('🌐 ProxyManager: Nenhum proxy configurado');
    }
  }

  /** Retorna o próximo proxy da lista (Round-Robin) */
  public getNextProxy(): string | null {
    if (this.proxies.length === 0) return null;

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    
    return proxy;
  }

  /** Verifica se existem proxies configurados */
  public hasProxies(): boolean {
    return this.proxies.length > 0;
  }
}

// Singleton
export const proxyManager = new ProxyManager();

// ============================================
// Tipos globais do projeto
// ============================================

/** Lojas suportadas pelo bot */
export type Store =
  | 'kabum'
  | 'pichau'
  | 'terabyte'
  | 'amazon'
  | 'mercadolivre'
  | 'magazineluiza'
  | 'aliexpress'
  | 'shopee'
  | 'gkinfostore';

/** Categorias de produtos */
export type ProductCategory =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'ram1x16'

  | 'ram2x16'
  | 'ssd'
  | 'nvme'
  | 'psu'
  | 'case'
  | 'cooler'
  | 'monitor'
  | 'mouse'
  | 'keyboard'
  | 'headset'
  | 'mousepad'
  | 'wifi_adapter'
  | 'webcam'
  | 'microphone'
  | 'peripheral'
  | 'chair'
  | 'other';

/** Produto monitorado no banco de dados */
export interface Product {
  id: number;
  url: string;
  store: Store;
  category: ProductCategory;
  name: string | null;
  current_price: number | null;
  lowest_price: number | null;
  target_price: number | null;
  alert_percent?: number | null;
  last_alert_msg_id?: number | null;
  last_available?: number; // 0 = indisponível, 1 = disponível
  last_checked_at?: string | null;
  created_at: string;
  active: number; // SQLite boolean (0 ou 1)
  consecutive_failures: number;
  direct_url?: string | null;
  is_watchlist?: number; // 0 = standard, 1 = watchlist
  group_id?: string | null;
  worth_score?: number | null;
}

/** Especificações técnicas de um componente */
export interface ComponentSpecs {
  product_id: number;
  socket?: string | null;
  form_factor?: string | null;
  tdp_watts?: number | null;
  memory_type?: string | null;
  vram_gb?: number | null;
  nvme_gen?: number | null;
  psu_watts?: number | null;
}

/** Registro de histórico de preço */
export interface PriceRecord {
  id: number;
  product_id: number;
  price: number;
  available: number; // 1 = disponível, 0 = indisponível
  checked_at: string;
}

/** Configuração persistente */
export interface Setting {
  key: string;
  value: string;
}

/** Resultado de um scraping */
export interface CategoryBestPrice {
  category: string;
  best_price: number;
  name: string;
  store: string;
  url: string;
  id: number;
  socket?: string | null;
  memory_type?: string | null;
  tdp_watts?: number | null;
  psu_watts?: number | null;
  vram_gb?: number | null;
}

/** Resultado de um scraping */
export interface ScrapeResult {
  name: string;
  price: number | null;
  available: boolean;
  originalPrice?: number | null; // Preço sem desconto (riscado)
  pixPrice?: number | null;      // Preço com desconto PIX
  installments?: string | null;  // Ex: "12x R$ 125,00"
  imageUrl?: string | null;
  coupon?: string | null;
  freeShipping?: boolean;
  variations?: {
    label: string;      // Ex: "Cor", "Voltagem"
    value: string;      // Ex: "Preto", "220V"
    url: string;        // URL para esta variação
    available: boolean; // Se está em estoque
  }[];
  productUrl?: string;
  similarProducts?: { name: string; url: string; price?: number | null }[];
}

/** Ponto de preço para análise de tendência */
export interface TrendPoint {
  price: number;
  checked_at: string;
}

/** Informações de tendência de preço */
export interface TrendInfo {
  direction: 'down' | 'stable_low' | 'up' | 'neutral';
  changePercent: number; // Mudança em relação à média recente
  isLowestStable: boolean; // Se está no mínimo estável (> 48h)
}

export interface AlertData {
  text: string;
  imageUrl?: string | null;
  productId?: number;
  priority: 'high' | 'normal';
  replyMarkup?: any; // Fase 7.5: Inline keyboard
}

/** Definição de produto para seed */
export interface SeedProduct {
  url: string;
  store: Store;
  category: ProductCategory;
  name: string;
  target_price: number | null;
}

/** BullMQ: Dados para o job de checagem de produto único */
export interface CheckProductJobData {
  productId: number;
  force?: boolean;
}

/** BullMQ: Dados para o job de envio de alerta */
export interface SendAlertJobData {
  chatId: string;
  text: string;
  imageUrl?: string | null;
  productId?: number;
}

/** Promoção vinda de feed externo (Pelando, Telegram, etc) */
export interface ExternalPromo {
  source: 'pelando' | 'telegram';
  external_id: string; // ID da plataforma (ex: d-xxxx no pelando)
  title: string;
  price: number | null;
  url: string;
  coupon?: string | null;
  discovered_at?: string;
}
/** Alvo de busca para o Caçador Automático */
export interface HunterTarget {
  query: string;
  category: ProductCategory;
  keywords: string[]; // Keywords obrigatórias para evitar falsos positivos (ex: "RTX", "4060")
}

/** Resultado positivo do Caçador Automático (Outlier detectado) */
export interface HunterHit {
  target: HunterTarget;
  store: string;
  url: string;
  name: string;
  price: number;
  medianPrice: number;
  savingsPercent: number;
}

/** Cupom de desconto genérico (da loja/categoria) */
export interface GenericCoupon {
  id: number;
  store: string;
  code: string;
  description?: string | null;
  category?: string | null;
  min_purchase?: number | null;
  discount_value?: number | null;
  discount_type?: 'percent' | 'fixed' | null;
  discovered_at: string;
  expires_at?: string | null;
  active: number;
}

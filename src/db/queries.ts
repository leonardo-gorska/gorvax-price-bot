// ============================================
// Database — Queries CRUD (cached statements)
// ============================================

import { getDatabase } from './index';
import type { Product, PriceRecord, Setting } from '../types';
import { logger } from '../utils/logger';
import { HISTORY_RETENTION_DAYS, MAX_CONSECUTIVE_FAILURES, getConfig } from '../config';
import { guessCategory } from '../services/categorizer';

// ─── Cached Prepared Statements ────────────
// Lazy initialization: created on first use

let _stmts: ReturnType<typeof createStatements> | null = null;

function getStmts() {
  if (!_stmts) _stmts = createStatements();
  return _stmts;
}

/** Retorna as últimas promoções externas capturadas */
export function getLastExternalPromos(limit: number = 10): any[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM external_promos 
    ORDER BY discovered_at DESC 
    LIMIT ?
  `).all(limit);
}

function createStatements() {
  const db = getDatabase();
  return {
    addProduct: db.prepare(`
      INSERT INTO products (url, store, category, name, target_price, alert_percent, direct_url, is_watchlist, group_id)
      VALUES (@url, @store, @category, @name, @target_price, @alert_percent, @direct_url, @is_watchlist, @group_id)
    `),
    getById: db.prepare('SELECT * FROM products WHERE id = ?'),
    getByUrl: db.prepare('SELECT * FROM products WHERE url = ?'),
    listActive: db.prepare('SELECT * FROM products WHERE active = 1 AND is_watchlist = 0 ORDER BY category, name'),
    listByCategory: db.prepare('SELECT * FROM products WHERE active = 1 AND is_watchlist = 0 AND category = ? ORDER BY name'),
    listByStore: db.prepare('SELECT * FROM products WHERE active = 1 AND is_watchlist = 0 AND store = ? ORDER BY category, name'),
    listWatchlist: db.prepare('SELECT * FROM products WHERE active = 1 AND is_watchlist = 1 ORDER BY category, name'),
    listByGroupId: db.prepare('SELECT * FROM products WHERE active = 1 AND group_id = ? ORDER BY store'),
    listAllActive: db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY category, name'),
    toggleWatchlist: db.prepare('UPDATE products SET is_watchlist = ? WHERE id = ?'),
    countActive: db.prepare('SELECT COUNT(*) as count FROM products WHERE active = 1 AND is_watchlist = 0'),
    updatePrice: db.prepare(`
      UPDATE products
      SET current_price = ?,
          lowest_price = ?,
          name = COALESCE(?, name),
          last_checked_at = datetime('now', 'localtime'),
          consecutive_failures = 0,
          direct_url = COALESCE(?, direct_url)
      WHERE id = ?
    `),
    setTarget: db.prepare('UPDATE products SET target_price = ? WHERE id = ?'),
    setAlertPercent: db.prepare('UPDATE products SET alert_percent = ? WHERE id = ?'),
    setLastAlertMsgId: db.prepare('UPDATE products SET last_alert_msg_id = ? WHERE id = ?'),
    updateUrl: db.prepare('UPDATE products SET url = ? WHERE id = ?'),
    updateAvailability: db.prepare('UPDATE products SET last_available = ? WHERE id = ?'),
    setTargetByCat: db.prepare('UPDATE products SET target_price = ? WHERE active = 1 AND category = ?'),
    updateGroupId: db.prepare('UPDATE products SET group_id = ? WHERE id = ?'),
    updateWorthScore: db.prepare('UPDATE products SET worth_score = ? WHERE id = ?'),
    deactivate: db.prepare('UPDATE products SET active = 0 WHERE id = ?'),
    deleteProduct: db.prepare('DELETE FROM products WHERE id = ?'),
    recordPrice: db.prepare('INSERT INTO price_history (product_id, price, available) VALUES (?, ?, ?)'),
    getHistory: db.prepare('SELECT * FROM price_history WHERE product_id = ? ORDER BY checked_at DESC LIMIT ?'),
    getLastPrice: db.prepare('SELECT * FROM price_history WHERE product_id = ? ORDER BY checked_at DESC LIMIT 1'),
    setSetting: db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'),
    getSetting: db.prepare('SELECT value FROM settings WHERE key = ?'),
    triggeredAlerts: db.prepare(`
      SELECT * FROM products
      WHERE active = 1
        AND target_price IS NOT NULL
        AND current_price IS NOT NULL
        AND current_price <= target_price
      ORDER BY category, name
    `),
    incrementFailures: db.prepare('UPDATE products SET consecutive_failures = consecutive_failures + 1 WHERE id = ?'),
    getFailedProducts: db.prepare(`
      SELECT * FROM products
      WHERE active = 1 AND consecutive_failures >= ?
    `),
    autoDisableFailed: db.prepare(`
      UPDATE products SET active = 0
      WHERE active = 1 AND consecutive_failures >= ?
    `),
    cleanOldHistory: db.prepare(`
      DELETE FROM price_history
      WHERE checked_at < datetime('now', 'localtime', ? || ' days')
    `),
    getStoreStats: db.prepare(`
      SELECT store, COUNT(*) as total,
             SUM(CASE WHEN current_price IS NOT NULL THEN 1 ELSE 0 END) as with_price,
             SUM(CASE WHEN consecutive_failures > 0 THEN 1 ELSE 0 END) as failing
      FROM products WHERE active = 1
      GROUP BY store
    `),
    getCrossStoreProducts: db.prepare(`
      SELECT p1.name as name, p1.store as store, p1.current_price as price, p1.url as url
      FROM products p1
      WHERE p1.active = 1 AND p1.current_price IS NOT NULL
      AND p1.name IN (
        SELECT p2.name FROM products p2
        WHERE p2.active = 1 AND p2.current_price IS NOT NULL AND p2.store != p1.store
      )
      ORDER BY p1.name, p1.current_price
    `),
    exportAll: db.prepare(`
      SELECT p.id, p.url, p.store, p.category, p.name,
             p.current_price, p.lowest_price, p.target_price, p.alert_percent,
             p.last_checked_at, p.created_at, p.active, p.consecutive_failures, p.direct_url, p.worth_score
      FROM products p
      ORDER BY p.category, p.name
    `),
    trendData: db.prepare(`
      SELECT price, checked_at FROM price_history
      WHERE product_id = ? AND checked_at >= datetime('now', 'localtime', '-30 days')
      ORDER BY checked_at ASC
    `),
    upsertSpecs: db.prepare(`
      INSERT INTO component_specs (product_id, socket, form_factor, tdp_watts, memory_type, vram_gb, nvme_gen, psu_watts)
      VALUES (@product_id, @socket, @form_factor, @tdp_watts, @memory_type, @vram_gb, @nvme_gen, @psu_watts)
      ON CONFLICT(product_id) DO UPDATE SET
        socket = excluded.socket,
        form_factor = excluded.form_factor,
        tdp_watts = excluded.tdp_watts,
        memory_type = excluded.memory_type,
        vram_gb = excluded.vram_gb,
        nvme_gen = excluded.nvme_gen,
        psu_watts = excluded.psu_watts
    `),
    bestPerCategory: db.prepare(`
      SELECT p.category, MIN(p.current_price) as best_price, p.name, p.store, p.url, p.id,
             cs.socket, cs.memory_type, cs.tdp_watts, cs.psu_watts, cs.vram_gb
      FROM products p
      LEFT JOIN component_specs cs ON p.id = cs.product_id
      WHERE p.active = 1 AND p.current_price IS NOT NULL
      GROUP BY p.category
      ORDER BY p.category
    `),
    searchByName: db.prepare(`
      SELECT * FROM products
      WHERE active = 1 AND name LIKE '%' || ? || '%'
      ORDER BY current_price ASC
      LIMIT 20
    `),
    getTopByCategory: db.prepare(`
      SELECT * FROM products
      WHERE active = 1 AND category = ? AND current_price IS NOT NULL
      ORDER BY current_price ASC
      LIMIT ?
    `),
    dailyDrops: db.prepare(`
      SELECT p.*, ((ph.price - p.current_price) * 100.0 / ph.price) as drop_percent
      FROM products p
      JOIN price_history ph ON p.id = ph.product_id
      WHERE p.active = 1
        AND p.current_price IS NOT NULL
        AND ph.checked_at >= datetime('now', 'localtime', '-24 hours')
        AND p.current_price < ph.price
      GROUP BY p.id
      HAVING drop_percent >= 5
      ORDER BY drop_percent DESC
      LIMIT 10
    `),
    allTimeLows: db.prepare(`
      SELECT * FROM products
      WHERE active = 1
        AND current_price IS NOT NULL
        AND lowest_price IS NOT NULL
        AND current_price <= lowest_price
      ORDER BY category, name
    `),
    saveCoupon: db.prepare(`
      INSERT INTO coupons (product_id, code)
      VALUES (?, ?)
      ON CONFLICT(product_id, code) DO UPDATE SET
        last_seen_at = datetime('now', 'localtime'),
        active = 1
    `),
    isNewCoupon: db.prepare(`
      SELECT COUNT(*) as count FROM coupons
      WHERE product_id = ? AND code = ? AND active = 1
    `),
    listActiveCoupons: db.prepare(`
      SELECT c.*, p.name as product_name, p.store
      FROM coupons c
      JOIN products p ON c.product_id = p.id
      WHERE c.active = 1
    `),
    saveGenericCoupon: db.prepare(`
      INSERT INTO generic_coupons (store, code, description, category, min_purchase, discount_value, discount_type, expires_at)
      VALUES (@store, @code, @description, @category, @min_purchase, @discount_value, @discount_type, @expires_at)
      ON CONFLICT(store, code) DO UPDATE SET
        active = 1,
        expires_at = COALESCE(excluded.expires_at, expires_at),
        description = COALESCE(excluded.description, description)
    `),
    listActiveGenericCoupons: db.prepare(`
      SELECT * FROM generic_coupons WHERE active = 1 ORDER BY store, discovered_at DESC
    `),
    deactivateGenericCoupon: db.prepare(`
      UPDATE generic_coupons SET active = 0 WHERE id = ?
    `),
    addSubscription: db.prepare(`
      INSERT INTO subscriptions (chat_id, type)
      VALUES (?, ?)
      ON CONFLICT(chat_id, type) DO UPDATE SET active = 1
    `),
    removeSubscription: db.prepare(`
      UPDATE subscriptions SET active = 0 WHERE chat_id = ? AND type = ?
    `),
    listSubscriptionsByType: db.prepare(`
      SELECT chat_id FROM subscriptions WHERE type = ? AND active = 1
    `),
  };
}

/** Reset cached statements (call after DB re-init) */
export function resetStatements(): void {
  _stmts = null;
}

// ─── Products ──────────────────────────────

/** Adiciona um produto */
export function addProduct(data: {
  url: string;
  store: string;
  category?: string;
  name?: string;
  target_price?: number;
  alert_percent?: number;
  is_watchlist?: number;
  group_id?: string | null;
}): Product {
  const info = getStmts().addProduct.run({
    url: data.url,
    store: data.store,
    category: (data.category && data.category !== 'other') ? data.category : (data.name ? guessCategory(data.name) : 'other'),
    name: data.name || null,
    target_price: data.target_price || null,
    alert_percent: data.alert_percent || null,
    direct_url: (data as any).direct_url || null,
    is_watchlist: data.is_watchlist || 0,
    group_id: data.group_id || null,
  });
  return getProductById(info.lastInsertRowid as number)!;
}

/** Busca produto por ID */
export function getProductById(id: number): Product | undefined {
  return getStmts().getById.get(id) as Product | undefined;
}

/** Busca produto por URL */
export function getProductByUrl(url: string): Product | undefined {
  return getStmts().getByUrl.get(url) as Product | undefined;
}

/** Lista todos os produtos ativos (do setup principal) */
export function listActiveProducts(): Product[] {
  return getStmts().listActive.all() as Product[];
}

/** Lista todos os produtos da watchlist */
export function listWatchlist(): Product[] {
  return getStmts().listWatchlist.all() as Product[];
}

/** Lista ABSOLUTAMENTE todos os ativos (setup + watchlist) para o scheduler */
export function listAllActiveProducts(): Product[] {
  return getStmts().listAllActive.all() as Product[];
}

/** Lista produtos por categoria */
export function listProductsByCategory(category: string): Product[] {
  return getStmts().listByCategory.all(category) as Product[];
}

/** Lista produtos por grupo (similares) */
export function listProductsByGroupId(groupId: string): Product[] {
  return getStmts().listByGroupId.all(groupId) as Product[];
}

/** Lista produtos por loja */
export function listProductsByStore(store: string): Product[] {
  return getStmts().listByStore.all(store) as Product[];
}

/** Atualiza preço de um produto */
export function updateProductPrice(id: number, price: number | null, scrapedName?: string, directUrl?: string | null): void {
  const product = getProductById(id);
  if (!product) return;

  const newLowest = product.lowest_price == null || (price != null && price < product.lowest_price)
    ? price
    : product.lowest_price;

  // Se a categoria for 'other', tenta adivinhar pelo nome novo
  if (product.category === 'other' && scrapedName) {
    const newCat = guessCategory(scrapedName);
    if (newCat !== 'other') {
      const db = getDatabase();
      db.prepare('UPDATE products SET category = ? WHERE id = ?').run(newCat, id);
    }
  }

  getStmts().updatePrice.run(price, newLowest, scrapedName || null, directUrl || null, id);

  // Dispara o cálculo do Worth It Score (Fase 10.3)
  if (price != null) {
    // Import dinâmico para evitar dependência circular
    const { updateWorthScore } = require('../services/worthScore');
    updateWorthScore(id).catch((err: any) => {
      logger.error({ productId: id, error: err.message }, 'Falha ao atualizar Worth It Score');
    });
  }
}

/** Define a URL direta de um produto */
export function updateDirectUrl(id: number, directUrl: string): void {
  const db = getDatabase();
  db.prepare('UPDATE products SET direct_url = ? WHERE id = ?').run(directUrl, id);
}

/** Define preço alvo por ID */
export function setTargetPrice(id: number, targetPrice: number): void {
  getStmts().setTarget.run(targetPrice, id);
}

/** Define alerta percentual por ID */
export function setAlertPercent(id: number, percent: number | null): void {
  getStmts().setAlertPercent.run(percent, id);
}

/** Define o ID da última mensagem de alerta enviada */
export function setLastAlertMsgId(id: number, msgId: number | null): void {
  getStmts().setLastAlertMsgId.run(msgId, id);
}

/** Atualiza a URL de um produto (Auto-Repair) */
export function updateProductUrl(id: number, url: string): void {
  getStmts().updateUrl.run(url, id);
}

/** Atualiza status de disponibilidade */
export function updateAvailability(id: number, available: boolean): void {
  getStmts().updateAvailability.run(available ? 1 : 0, id);
}

/** Alterna o status da watchlist */
export function toggleWatchlist(id: number, state: number): void {
  getStmts().toggleWatchlist.run(state, id);
}

/** Define o group_id de um produto */
export function updateProductGroupId(id: number, groupId: string | null): void {
  getStmts().updateGroupId.run(groupId, id);
}

/** Define o worth_score de um produto */
export function setWorthScore(id: number, score: number | null): void {
  getStmts().updateWorthScore.run(score, id);
}

/** Define preço alvo por categoria */
export function setTargetPriceByCategory(category: string, targetPrice: number): number {
  const info = getStmts().setTargetByCat.run(targetPrice, category);
  return info.changes;
}

/** Remove (desativa) um produto */
export function deactivateProduct(id: number): void {
  getStmts().deactivate.run(id);
}

/** Remove permanentemente */
export function deleteProduct(id: number): void {
  getStmts().deleteProduct.run(id);
}

/** Conta total de produtos ativos */
export function countActiveProducts(): number {
  const row = getStmts().countActive.get() as { count: number };
  return row.count;
}

// ─── Price History ─────────────────────────

/** Registra um preço no histórico */
export function recordPrice(productId: number, price: number, available: boolean = true): void {
  getStmts().recordPrice.run(productId, price, available ? 1 : 0);
}

/** Busca histórico de preços */
export function getPriceHistory(productId: number, limit: number = 20): PriceRecord[] {
  return getStmts().getHistory.all(productId, limit) as PriceRecord[];
}

/** Busca o preço mais recente */
export function getLastPrice(productId: number): PriceRecord | undefined {
  return getStmts().getLastPrice.get(productId) as PriceRecord | undefined;
}

// ─── Settings ──────────────────────────────

/** Salva uma configuração */
export function setSetting(key: string, value: string): void {
  getStmts().setSetting.run(key, value);
}

/** Busca uma configuração */
export function getSetting(key: string): string | undefined {
  const row = getStmts().getSetting.get(key) as Setting | undefined;
  return row?.value;
}

// ─── Enterprise: Alerts ────────────────────

/** Lista produtos cujo preço atingiu o alvo */
export function getTriggeredAlerts(): Product[] {
  return getStmts().triggeredAlerts.all() as Product[];
}

// ─── Enterprise: Dead Link Detection ──────

/** Incrementa contador de falhas consecutivas */
export function incrementFailures(productId: number): void {
  getStmts().incrementFailures.run(productId);
}

/** Lista produtos que falharam demais */
export function getFailedProducts(): Product[] {
  return getStmts().getFailedProducts.all(MAX_CONSECUTIVE_FAILURES) as Product[];
}

/** Auto-desativa produtos com muitas falhas consecutivas */
export function autoDisableFailedProducts(): number {
  const info = getStmts().autoDisableFailed.run(MAX_CONSECUTIVE_FAILURES);
  if (info.changes > 0) {
    logger.warn({ count: info.changes }, '🚫 Produtos auto-desativados por falhas consecutivas');
  }
  return info.changes;
}

// ─── Enterprise: History Cleanup ───────────

/** Remove registros de histórico mais antigos que HISTORY_RETENTION_DAYS */
export function cleanOldPriceHistory(): number {
  const info = getStmts().cleanOldHistory.run(`-${HISTORY_RETENTION_DAYS}`);
  if (info.changes > 0) {
    logger.info({ deleted: info.changes, retentionDays: HISTORY_RETENTION_DAYS }, '🧹 Histórico antigo limpo');
  }
  return info.changes;
}

// ─── Enterprise: Store Health ──────────────

export interface StoreStats {
  store: string;
  total: number;
  with_price: number;
  failing: number;
}

/** Retorna estatísticas por loja */
export function getStoreStats(): StoreStats[] {
  return getStmts().getStoreStats.all() as StoreStats[];
}

export interface CrossStorePrice {
  id: number;
  name: string;
  store: string;
  price: number;
  url: string;
}

/** Busca produtos com preço em múltiplas lojas para comparação */
export function getCrossStorePrices(): CrossStorePrice[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT p1.id, p1.name as name, p1.store as store, p1.current_price as price, p1.url as url
    FROM products p1
    WHERE p1.active = 1 AND p1.current_price IS NOT NULL
    AND p1.name IN (
      SELECT p2.name FROM products p2
      WHERE p2.active = 1 AND p2.current_price IS NOT NULL AND p2.store != p1.store
    )
    ORDER BY p1.name, p1.current_price
  `).all() as CrossStorePrice[];
}

// ─── Enterprise: Export ────────────────────

/** Exporta todos os produtos para formato plano */
export function exportAllProducts(): Product[] {
  return getStmts().exportAll.all() as Product[];
}

// ─── Enterprise: Trend Analysis ────────────

export interface TrendPoint {
  price: number;
  checked_at: string;
}

/** Busca dados de tendência (últimos 30 dias) */
export function getTrendData(productId: number): TrendPoint[] {
  return getStmts().trendData.all(productId) as TrendPoint[];
}

// ─── Enterprise: Build Simulator ───────────

export interface CategoryBestPrice {
  category: string;
  best_price: number;
  name: string;
  store: string;
  url: string;
  id: number;
}

/** Retorna o produto mais barato de cada categoria */
export function getBestPricePerCategory(): CategoryBestPrice[] {
  return getStmts().bestPerCategory.all() as CategoryBestPrice[];
}

// ─── Enterprise: Search ────────────────────

/** Busca produtos por nome (fuzzy) */
export function searchProductsByName(query: string): Product[] {
  return getStmts().searchByName.all(query) as Product[];
}

/** Retorna os X produtos mais baratos de uma categoria */
export function getTopProductsByCategory(category: string, limit: number = 5): Product[] {
  return getStmts().getTopByCategory.all(category, limit) as Product[];
}

/** Salva ou atualiza especificações de um componente */
export function upsertComponentSpecs(productId: number, specs: Partial<import('../types').ComponentSpecs>): void {
  getStmts().upsertSpecs.run({
    product_id: productId,
    socket: specs.socket || null,
    form_factor: specs.form_factor || null,
    tdp_watts: specs.tdp_watts || null,
    memory_type: specs.memory_type || null,
    vram_gb: specs.vram_gb || null,
    nvme_gen: specs.nvme_gen || null,
    psu_watts: specs.psu_watts || null,
  });
}

/** Busca produtos com as maiores quedas nas últimas 24h */
export function getDailyDrops(): (Product & { drop_percent: number })[] {
  return getStmts().dailyDrops.all() as (Product & { drop_percent: number })[];
}

/** Busca produtos no menor preço histórico */
export function getAllTimeLows(): Product[] {
  return getStmts().allTimeLows.all() as Product[];
}

/** 
 * Implementa o Auto-Target (Fase 6.2):
 * Define o preço alvo como 80% da média dos últimos 30 dias.
 */
export function applyAutoTarget(productId: number): { success: boolean, name: string | null, oldTarget: number | null, newTarget: number | null } {
  const trend = getTrendData(productId);
  if (trend.length < 5) return { success: false, name: null, oldTarget: null, newTarget: null };

  const product = getProductById(productId);
  if (!product) return { success: false, name: null, oldTarget: null, newTarget: null };

  const sum = trend.reduce((a, b) => a + b.price, 0);
  const avg = sum / trend.length;
  
  if (isNaN(avg) || avg <= 0) return { success: false, name: product.name, oldTarget: product.target_price, newTarget: null };

  const newTarget = Math.round(avg * 0.8);
  const oldTarget = product.target_price;
  
  setTargetPrice(productId, newTarget);
  
  return { success: true, name: product.name, oldTarget, newTarget };
}

// ─── Coupons ───────────────────────────────

/** Salva um cupom encontrado */
export function saveCoupon(productId: number, code: string): void {
  getStmts().saveCoupon.run(productId, code.toUpperCase());
}

/** Verifica se um cupom já foi registrado */
export function isNewCoupon(productId: number, code: string): boolean {
  const row = getStmts().isNewCoupon.get(productId, code.toUpperCase()) as { count: number };
  return row.count === 0;
}

/** Lista cupons ativos */
export function listActiveCoupons(): any[] {
  return getStmts().listActiveCoupons.all();
}

/** Salva um cupom genérico (da loja) */
export function saveGenericCoupon(coupon: Partial<import('../types').GenericCoupon>): void {
  getStmts().saveGenericCoupon.run({
    store: coupon.store,
    code: coupon.code?.toUpperCase(),
    description: coupon.description || null,
    category: coupon.category || null,
    min_purchase: coupon.min_purchase || null,
    discount_value: coupon.discount_value || null,
    discount_type: coupon.discount_type || null,
    expires_at: coupon.expires_at || null,
  });
}

/** Lista cupons genéricos ativos */
export function listActiveGenericCoupons(): import('../types').GenericCoupon[] {
  return getStmts().listActiveGenericCoupons.all() as import('../types').GenericCoupon[];
}

/** Desativa um cupom genérico */
export function deactivateGenericCoupon(id: number): void {
  getStmts().deactivateGenericCoupon.run(id);
}

/** 
 * Retorna o Chat ID do banco ou fallback do .env se necessário.
 * Centralizado aqui para ser usado por todos os serviços.
 */
export function getEffectiveChatId(): string | undefined {
  const dbId = getSetting('chat_id');
  if (dbId && dbId !== '12345678') return dbId;
  const configId = getConfig().TELEGRAM_CHAT_ID;
  if (configId) {
    logger.info({ configId }, 'Usando Chat ID do fallback (.env)');
    return configId;
  }
  return undefined;
}

// ─── Subscriptions ─────────────────────────

/** Adiciona uma inscrição (alerts ou deals) */
export function addSubscription(chatId: string, type: 'alerts' | 'deals'): void {
  getStmts().addSubscription.run(chatId, type);
}

/** Remove uma inscrição */
export function removeSubscription(chatId: string, type: 'alerts' | 'deals'): void {
  getStmts().removeSubscription.run(chatId, type);
}

/** Lista todos os chat_ids inscritos em um tipo específico */
export function listSubscriptionsByType(type: 'alerts' | 'deals'): string[] {
  const rows = getStmts().listSubscriptionsByType.all(type) as { chat_id: string }[];
  return rows.map(r => r.chat_id);
}


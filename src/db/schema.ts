// ============================================
// Database — Schema (CREATE TABLE statements)
// ============================================

export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    store TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    name TEXT,
    current_price REAL,
    lowest_price REAL,
    target_price REAL,
    alert_percent REAL,
    worth_score INTEGER,
    last_checked_at TEXT,
    is_watchlist INTEGER DEFAULT 0,
    group_id TEXT
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    price REAL NOT NULL,
    available INTEGER DEFAULT 1,
    checked_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_price_history_product
    ON price_history(product_id);

  CREATE INDEX IF NOT EXISTS idx_price_history_date
    ON price_history(checked_at);

  CREATE INDEX IF NOT EXISTS idx_products_store
    ON products(store);

  CREATE INDEX IF NOT EXISTS idx_products_category
    ON products(category);

  CREATE INDEX IF NOT EXISTS idx_products_active
    ON products(active);

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    discovered_at TEXT DEFAULT (datetime('now', 'localtime')),
    last_seen_at TEXT DEFAULT (datetime('now', 'localtime')),
    active INTEGER DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(product_id, code)
  );

  CREATE TABLE IF NOT EXISTS generic_coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    category TEXT,
    min_purchase REAL,
    discount_value REAL,
    discount_type TEXT,
    discovered_at TEXT DEFAULT (datetime('now', 'localtime')),
    expires_at TEXT,
    active INTEGER DEFAULT 1,
    UNIQUE(store, code)
  );

  CREATE TABLE IF NOT EXISTS external_promos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    price REAL,
    url TEXT NOT NULL,
    coupon TEXT,
    discovered_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(source, external_id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    chat_id TEXT NOT NULL,
    type TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    PRIMARY KEY (chat_id, type)
  );
`;

export const MIGRATIONS = [
  'ALTER TABLE products ADD COLUMN consecutive_failures INTEGER DEFAULT 0',
  'ALTER TABLE products ADD COLUMN alert_percent REAL;',
  'ALTER TABLE products ADD COLUMN last_alert_msg_id INTEGER;',
  'ALTER TABLE products ADD COLUMN last_available INTEGER DEFAULT 1;',
  'ALTER TABLE products ADD COLUMN direct_url TEXT;',
  'CREATE TABLE IF NOT EXISTS component_specs (product_id INTEGER PRIMARY KEY, socket TEXT, form_factor TEXT, tdp_watts INTEGER, memory_type TEXT, vram_gb INTEGER, nvme_gen INTEGER, psu_watts INTEGER, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE)',
  'CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, code TEXT NOT NULL, discovered_at TEXT DEFAULT (datetime(\'now\', \'localtime\')), last_seen_at TEXT DEFAULT (datetime(\'now\', \'localtime\')), active INTEGER DEFAULT 1, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, UNIQUE(product_id, code))',
  'ALTER TABLE products ADD COLUMN is_watchlist INTEGER DEFAULT 0',
  'CREATE TABLE IF NOT EXISTS external_promos (id INTEGER PRIMARY KEY AUTOINCREMENT, source TEXT NOT NULL, external_id TEXT NOT NULL, title TEXT NOT NULL, price REAL, url TEXT NOT NULL, coupon TEXT, discovered_at TEXT DEFAULT (datetime(\'now\', \'localtime\')), UNIQUE(source, external_id))',
  'ALTER TABLE products ADD COLUMN group_id TEXT;',
  'ALTER TABLE products ADD COLUMN worth_score INTEGER;',
  'CREATE TABLE IF NOT EXISTS generic_coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, store TEXT NOT NULL, code TEXT NOT NULL, description TEXT, category TEXT, min_purchase REAL, discount_value REAL, discount_type TEXT, discovered_at TEXT DEFAULT (datetime(\'now\', \'localtime\')), expires_at TEXT, active INTEGER DEFAULT 1, UNIQUE(store, code))',
  'CREATE TABLE IF NOT EXISTS subscriptions (chat_id TEXT NOT NULL, type TEXT NOT NULL, active INTEGER DEFAULT 1, PRIMARY KEY (chat_id, type))',
];

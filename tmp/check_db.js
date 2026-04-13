const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'data/promo.db');
const db = new Database(dbPath);

const products = db.prepare("SELECT id, name, store, category, active FROM products WHERE name LIKE '%cadeira%' OR name LIKE '%fonte%'").all();
console.log(JSON.stringify(products, null, 2));
db.close();

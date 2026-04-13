const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'promo.db');
const db = new Database(dbPath);

console.log('--- Database Cleanup ---');

const ghostSubscribers = db.prepare("SELECT count(*) as count FROM subscriptions WHERE chat_id = '999999999' OR chat_id LIKE 'test%'").get();
console.log(`Found ${ghostSubscribers.count} ghost subscriptions.`);

if (ghostSubscribers.count > 0) {
  const result = db.prepare("DELETE FROM subscriptions WHERE chat_id = '999999999' OR chat_id LIKE 'test%'").run();
  console.log(`Deleted ${result.changes} invalid subscriptions.`);
}

console.log('Cleanup complete.');
db.close();

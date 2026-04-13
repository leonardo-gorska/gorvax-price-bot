// ============================================
// Database — Conexão SQLite + Migrations
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL, MIGRATIONS } from './schema';
import { logger } from '../utils/logger';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'promo.db');

let db: Database.Database;

/** Inicializa o banco de dados */
export function initDatabase(): Database.Database {
  // Cria o diretório data/ se não existir
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Backup de segurança antes de qualquer alteração (se o DB já existir)
  if (fs.existsSync(DB_PATH)) {
    preMigrationBackup();
  }

  db = new Database(DB_PATH);

  // Otimizações SQLite
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.pragma('cache_size = -8000');  // 8MB cache
  db.pragma('synchronous = NORMAL'); // Faster writes, still safe with WAL

  // Cria as tabelas
  db.exec(SCHEMA_SQL);

  // Roda migrations
  runMigrations(db);

  // Popula specs se necessário (proativo para o RoadMap)
  try {
    const { populateInitialSpecs } = require('./populate_specs');
    populateInitialSpecs();
  } catch (err) {
    logger.warn('Falha ao popular especificações iniciais');
  }

  logger.info({ path: DB_PATH }, 'Banco de dados inicializado');
  return db;
}

/** Executa migrations pendentes (silencia erros de "column already exists") */
function runMigrations(database: Database.Database): void {
  for (const migration of MIGRATIONS) {
    try {
      database.exec(migration);
      logger.info({ migration: migration.substring(0, 60) }, 'Migration aplicada');
    } catch (err: unknown) {
      // Silencia "duplicate column name" (já foi migrado)
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('duplicate column')) {
        logger.warn({ migration: migration.substring(0, 60), error: message }, 'Migration falhou');
      }
    }
  }
}

/** Retorna a instância do banco */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/** Desliga o banco de dados graciosamente */
export function closeDatabase(): void {
  if (db) {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    db.close();
    logger.info('Banco de dados fechado com sucesso');
  }
}

/** 
 * Cria um backup do banco de dados (rotaciona últimos 7 dias).
 * Utiliza a API nativa de backup do SQLite para garantir consistência.
 */
export async function backupDatabase(): Promise<void> {
  if (!db) return;

  const backupsDir = path.join(DATA_DIR, 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  // Nomeia baseado no dia da semana (0-6) para manter os últimos 7 dias
  const dayOfWeek = new Date().getDay();
  const backupFile = path.join(backupsDir, `promo_backup_day_${dayOfWeek}.db`);

  try {
    logger.info({ backupFile }, 'Iniciando backup do banco de dados...');
    await db.backup(backupFile, {
      progress({ totalPages, remainingPages }) {
        logger.debug(
          { total: totalPages, remaining: remainingPages },
          'Progresso do backup'
        );
        return 100; // Tempo de delay menor para backups rápidos
      }
    });
    logger.info({ backupFile }, '✅ Backup concluído com sucesso');
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error({ error: message }, '❌ Erro ao criar backup do banco de dados');
  }
}

/** 
 * Cria um snapshot rápido do arquivo promo.db antes de rodar migrations.
 * Backup de "último recurso" salvo como promo_pre_migration.db.
 */
export function preMigrationBackup(): void {
  const backupsDir = path.join(DATA_DIR, 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const backupFile = path.join(backupsDir, 'promo_pre_migration.db');
  try {
    fs.copyFileSync(DB_PATH, backupFile);
    logger.info({ backupFile }, '🛡️ Backup de pré-migração realizado');
  } catch (err) {
    logger.error('Falha ao realizar backup de pré-migração');
  }
}

/** Executa WAL checkpoint (para limpeza periódica) */
export function walCheckpoint(): void {
  if (db) {
    try {
      db.pragma('wal_checkpoint(PASSIVE)');
      logger.debug('WAL checkpoint executado');
    } catch { /* ignore */ }
  }
}

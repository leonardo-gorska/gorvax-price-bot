// ============================================
// Script: Backup Manual / Independente
// ============================================

import { initDatabase, backupDatabase, closeDatabase } from '../db/index';
import { logger } from '../utils/logger';

async function runStandaloneBackup() {
  logger.info('🚀 Iniciando script de backup manual...');
  
  try {
    // Inicializa sem rodar migrations pesadas se possível (initDatabase já cuida disso)
    initDatabase();
    
    await backupDatabase();
    
    logger.info('✨ Backup manual finalizado.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, '❌ Falha fatal no script de backup');
  } finally {
    closeDatabase();
  }
}

runStandaloneBackup();

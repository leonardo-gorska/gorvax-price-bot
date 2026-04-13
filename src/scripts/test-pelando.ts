// ============================================
// Script de Teste — Pelando Scraper & Matcher
// ============================================

import { initDatabase } from '../db/index';
import { scrapePelando } from '../scrapers/pelando';
import { processNewPromos, formatPromoMatchAlert } from '../services/promo_matcher';
import { logger } from '../utils/logger';

async function test() {
  logger.info('🚀 Iniciando teste do Feed de Promoções...');

  // 1. Inicializa o banco (melhor trabalhar com a instância real para ver matches)
  initDatabase();

  // 2. Raspa o Pelando
  const promos = await scrapePelando();
  
  if (promos.length === 0) {
    logger.error('❌ Nenhuma promoção capturada. Verifique o scraper.');
    return;
  }

  logger.info(`✅ ${promos.length} promoções capturadas do Pelando.`);

  // Logar detalhes para depuração
  promos.forEach((p, i) => {
    logger.debug(`[${i+1}] ${p.title} - R$ ${p.price || 'N/A'}`);
  });

  // 3. Processa e busca matches
  logger.info('🔍 Buscando matches com produtos monitorados...');
  const matches = await processNewPromos(promos);

  if (matches.length === 0) {
    logger.warn('⚠️ Nenhuma promoção deu match com os produtos monitorados.');
    logger.info('Dica: Adicione produtos populares (ex: RTX 4060, Ryzen 5 5600) para ver matches.');
  } else {
    logger.info(`🎯 ${matches.length} matches encontrados!`);
    
    for (const match of matches) {
      console.log('\n' + '='.repeat(40));
      console.log(formatPromoMatchAlert(match));
      console.log('='.repeat(40) + '\n');
    }
  }

  logger.info('🏁 Teste concluído.');
}

test().catch(console.error);

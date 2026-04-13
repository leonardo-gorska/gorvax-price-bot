import { scrapeUrl } from '../src/scrapers';
import { logger } from '../src/utils/logger';
import { closeBrowser, getMemoryUsage } from '../src/scrapers/base';

async function runTest() {
  const urls = [
    'https://www.kabum.com.br/produto/475438/processador-amd-ryzen-5-7600-3-8ghz-5-1ghz-max-turbo-cache-38mb-am5-6-nucleos-video-integrado-100-100001015box',
    'https://www.pichau.com.br/processador-amd-ryzen-5-7600-6-core-12-threads-3-8ghz-5-1ghz-turbo-cache-38mb-am5-100-100001015box',
    'https://www.terabyteshop.com.br/produto/23447/processador-amd-ryzen-5-7600-38ghz-51ghz-turbo-6-cores-12-threads-am5-com-cooler-wraith-stealth-100-100001015box',
    'https://www.amazon.com.br/Processador-AMD-Ryzen-7600-Arquitetura/dp/B0BMQJWZ14'
  ];

  logger.info('🚀 Iniciando teste de performance (Fase 8.1)');
  logger.info({ initialRam: getMemoryUsage() }, 'Memória inicial');

  // Fazemos dois rounds de scraping para verificar o reuso de abas no segundo round
  
  logger.info('--- Round 1: Aquecimento (Criando abas) ---');
  const results1 = await Promise.all(urls.map(url => scrapeUrl(url)));
  logger.info({ ramAfterRound1: getMemoryUsage() }, 'Memória após Round 1');

  logger.info('--- Round 2: Reuso de abas (Deve ser mais rápido nos logs de "reutilizando aba") ---');
  const results2 = await Promise.all(urls.map(url => scrapeUrl(url)));
  logger.info({ ramAfterRound2: getMemoryUsage() }, 'Memória após Round 2');

  await closeBrowser();
  logger.info('🏁 Teste concluído');
}

runTest().catch(err => {
  logger.error({ err }, 'Erro no teste');
  process.exit(1);
});

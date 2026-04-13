// ============================================
// Logger — Configuração Avançada com Rotação
// ============================================

import pino from 'pino';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'data', 'logs');
const level = process.env.LOG_LEVEL || 'debug';

// Configuração de transporte para pino-roll (arquivos rotativos)
const transport = pino.transport({
  targets: [
    // 1. Console (Sempre em modo legível no terminal)
    {
      target: 'pino-pretty',
      level: level,
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      },
    },
    // 2. Arquivo Completo (app.log)
    {
      target: 'pino-roll',
      level: level,
      options: {
        file: path.join(LOG_DIR, 'app.log'),
        size: '10m',
        interval: '1d',
        mkdir: true,
      },
    },
    // 3. Apenas Erros (error.log)
    {
      target: 'pino-roll',
      level: 'error',
      options: {
        file: path.join(LOG_DIR, 'error.log'),
        size: '5m',
        interval: '1d',
        mkdir: true,
      },
    },
  ],
});

export const logger = pino(
  {
    level: level,
    base: { pid: false },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

// Logger filho específico para Scrapers
export const scraperLogger = logger.child({ component: 'scraper' });

import { Queue, Worker, Job } from 'bullmq';
import { Bot } from 'grammy';
import { getRedis } from '../utils/redis';
import { logger } from '../utils/logger';
import { 
  enqueueProductChecks, 
  processSingleProduct, 
  performSendAlert,
  sendMorningReport, 
  sendWeeklyReport, 
  runMaintenance, 
  runAutoTargetUpdate 
} from './index';
import { CheckProductJobData, SendAlertJobData } from '../types';

const QUEUE_NAME = 'gorvax-jobs';

/** Nomes de todos os jobs disponíveis para o agendador */
export enum JobName {
  ENQUEUE_CHECKS = 'enqueue_checks',
  CHECK_PRODUCT = 'check_product',
  SEND_ALERT = 'send_alert',
  MORNING_REPORT = 'morning_report',
  WEEKLY_REPORT = 'weekly_report',
  MAINTENANCE = 'maintenance',
  AUTOTARGET = 'autotarget',
  PROMO_FEED = 'promo_feed',
  AUTO_HUNTER = 'auto_hunter',
  COUPON_SCAN = 'coupon_scan',
}

export const jobQueue = new Queue(QUEUE_NAME, {
  connection: getRedis() as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000 * 60 * 5, // 5 min
    },
    removeOnComplete: true,
    removeOnFail: 1000, // Mantém últimos 1000 erros
  },
});

export function startWorker(bot: Bot): Worker {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const friendlyNames: Record<string, string> = {
        [JobName.ENQUEUE_CHECKS]: '🎯 [MONITORAMENTO] Iniciando checagem de preços de itens ativos...',
        [JobName.CHECK_PRODUCT]: '🔍 [PRODUTO] Verificando integridade e preço atual...',
        [JobName.SEND_ALERT]: '📢 [ALERTA] Enviando notificação para os inscritos...',
        [JobName.MORNING_REPORT]: '📅 [RELATÓRIO] Gerando resumo matinal das últimas 24h...',
        [JobName.WEEKLY_REPORT]: '🗓️ [RELATÓRIO] Gerando resumo semanal dos melhores preços...',
        [JobName.MAINTENANCE]: '🔧 [MANUTENÇÃO] Executando limpeza e otimização do banco...',
        [JobName.AUTOTARGET]: '🎯 [AUTO-TARGET] Atualizando preços-alvo baseados no mercado...',
        [JobName.PROMO_FEED]: '🔥 [FEED PELANDO] Iniciando captura de promoções externas...',
        [JobName.AUTO_HUNTER]: '🛡️ [CAÇADOR] Iniciando varredura automática de erros de preço...',
        [JobName.COUPON_SCAN]: '🎟️ [CUPONS] Buscando novos cupons ativos nas lojas...',
      };

      const startMsg = friendlyNames[job.name] || `🛠️ Processando job: ${job.name}`;
      logger.info({ jobName: job.name, jobId: job.id }, startMsg);

      try {
        switch (job.name) {
          case JobName.ENQUEUE_CHECKS:
            await enqueueProductChecks(bot);
            break;
          case JobName.CHECK_PRODUCT: {
            const data = job.data as CheckProductJobData;
            await processSingleProduct(bot, data.productId, !!data.force);
            break;
          }
          case JobName.SEND_ALERT: {
            const data = job.data as SendAlertJobData;
            await performSendAlert(bot, data);
            break;
          }
          case JobName.MORNING_REPORT:
            await sendMorningReport(bot);
            break;
          case JobName.WEEKLY_REPORT:
            await sendWeeklyReport(bot);
            break;
          case JobName.MAINTENANCE:
            await runMaintenance(bot);
            break;
          case JobName.AUTOTARGET:
            await runAutoTargetUpdate(bot);
            break;
          case JobName.PROMO_FEED:
            await import('./index').then(m => m.runPromoFeedCheck(bot));
            break;
          case JobName.AUTO_HUNTER:
            await import('../services/autoHunter').then(m => m.autoHunterService.runAutoHunter(bot));
            break;
          case JobName.COUPON_SCAN:
            await import('../services/coupon.service').then(m => m.couponService.runCouponScan(bot));
            break;
          default:
            logger.warn({ jobName: job.name }, '❓ Job desconhecido ignorado');
        }
      } catch (error: any) {
        logger.error({ jobName: job.name, jobId: job.id, error: error.message }, '❌ Falha ao processar conteúdo do job');
        throw error; // Re-throw para o BullMQ lidar com attempts/backoff
      }
    },
    { 
      connection: getRedis() as any,
      concurrency: 5 // Processar até 5 jobs simultâneos nesta instância
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobName: job.name, jobId: job.id }, `✅ [CONCLUÍDO] Fim da tarefa: ${job.name}`);
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobName: job?.name, jobId: job?.id, error: err.message }, `❌ [FALHA] Erro crítico na tarefa: ${job?.name}`);
  });

  return worker;
}

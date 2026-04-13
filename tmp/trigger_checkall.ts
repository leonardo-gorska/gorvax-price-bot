import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

async function trigger() {
  const queue = new Queue('gorvax-jobs', { connection });
  console.log('Disparando enqueue_checks...');
  // O nome do job deve ser igual ao JobName.ENQUEUE_CHECKS que é 'enqueue_checks'
  await queue.add('enqueue_checks', { force: true });
  console.log('Job enfileirado!');
  await connection.quit();
  process.exit(0);
}

trigger().catch(err => {
  console.error(err);
  process.exit(1);
});

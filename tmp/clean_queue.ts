import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

async function clean() {
  const queue = new Queue('gorvax-jobs', { connection });
  console.log('Limpando fila gorvax-jobs...');
  await queue.obliterate({ force: true });
  console.log('Fila limpa com sucesso!');
  await connection.quit();
  process.exit(0);
}

clean().catch(err => {
  console.error(err);
  process.exit(1);
});

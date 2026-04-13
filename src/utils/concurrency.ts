// ============================================
// Concurrency — Limitador de concorrência
// ============================================

export function pLimit(concurrency: number) {
  const queue: Array<() => void> = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      const resolve = queue.shift();
      resolve?.();
    }
  };

  const limiter = async <T>(fn: () => Promise<T>): Promise<T> => {
    if (activeCount >= concurrency) {
      await new Promise<void>((resolve) => {
        queue.push(resolve);
      });
    }

    activeCount++;

    try {
      return await fn();
    } finally {
      next();
    }
  };

  /** Retorna o número de tasks ativas */
  limiter.activeCount = () => activeCount;

  /** Retorna o número de tasks na fila */
  limiter.pendingCount = () => queue.length;

  return limiter;
}

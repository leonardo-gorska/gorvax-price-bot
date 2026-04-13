// ============================================
// Errors — Classes de erro estruturadas
// ============================================

/** Erro base do bot */
export class BotError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BotError';
  }
}

/** Erro de scraping (loja bloqueou, timeout, etc.) */
export class ScrapeError extends BotError {
  constructor(
    message: string,
    public readonly url: string,
    public readonly store: string,
    public readonly attempt?: number
  ) {
    super(message, 'SCRAPE_ERROR', { url, store, attempt });
    this.name = 'ScrapeError';
  }
}

/** Erro de validação de input do usuário */
export class ValidationError extends BotError {
  constructor(message: string, public readonly field: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

/** Erro de configuração */
export class ConfigError extends BotError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

/** Erro de banco de dados */
export class DatabaseError extends BotError {
  constructor(message: string, public readonly operation: string) {
    super(message, 'DATABASE_ERROR', { operation });
    this.name = 'DatabaseError';
  }
}

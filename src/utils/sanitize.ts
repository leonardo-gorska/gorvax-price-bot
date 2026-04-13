// ============================================
// Utils — Sanitização e validação de input
// ============================================

/** Valida se uma string é uma URL HTTP(S) válida */
export function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Bloqueia URLs potencialmente perigosas */
export function isSafeUrl(str: string): boolean {
  if (!isValidHttpUrl(str)) return false;

  const url = new URL(str);
  const hostname = url.hostname.toLowerCase();

  // Bloqueia localhost, IPs internos, file://, etc.
  const blocked = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '10.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
    '192.168.',
  ];

  for (const prefix of blocked) {
    if (hostname === prefix || hostname.startsWith(prefix)) return false;
  }

  // Limite de tamanho da URL
  if (str.length > 2048) return false;

  return true;
}

/** Escapa caracteres especiais do MarkdownV2 do Telegram */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-={}.!\\]|\|)/g, '\\$1');
}

/** Escapa apenas onde necessário para uso inline (mantém formatação intencional) */
export function safeText(text: string): string {
  return escapeMarkdownV2(text);
}

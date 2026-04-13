// ============================================
// Vitest Setup — Mocking Environment
// ============================================

process.env.TELEGRAM_BOT_TOKEN = '1234567890:ABCDEFGH-IJKLMNOPQRST-UVWXYZ123456';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.LOG_LEVEL = 'error'; // Mudo para error para não poluir o log dos testes

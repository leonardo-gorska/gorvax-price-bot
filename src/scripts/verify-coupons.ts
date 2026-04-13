import { couponService } from '../services/coupon.service';
import { logger } from '../utils/logger';
import { Bot } from 'grammy';
import { listActiveGenericCoupons } from '../db/queries';

async function test() {
  logger.info('🧪 Iniciando TESTE DE CUPONS...');
  
  // Mock do bot
  const mockBot = {
    api: {
      sendMessage: async (chatId: number, text: string) => {
        console.log(`[Mock Bot] Enviando para ${chatId}: \n${text}`);
        return { message_id: 123 };
      }
    }
  } as unknown as Bot;

  // Executar scan
  await couponService.runCouponScan(mockBot);

  // Verificar banco
  const coupons = listActiveGenericCoupons();
  console.log('\n📊 Cupons salvos no banco:');
  console.table(coupons.map(c => ({
    Loja: c.store,
    Código: c.code,
    Desc: c.description?.substring(0, 30),
    Valor: c.discount_value,
    Tipo: c.discount_type
  })));

  logger.info('✅ Teste finalizado');
  process.exit(0);
}

test();

import { evaluateAlerts } from '../scheduler/alerts';
import { Product, ScrapeResult, GenericCoupon } from '../types';

const mockProduct: Product = {
  id: 1,
  name: 'Placa de Vídeo RTX 4060',
  store: 'kabum',
  category: 'gpu',
  current_price: 2000,
  lowest_price: 2000,
  target_price: 1850,
  url: 'https://kabum.com.br/gpu',
  active: 1,
  consecutive_failures: 0,
  created_at: new Date().toISOString()
};

const mockResult: ScrapeResult = {
  name: 'Placa de Vídeo RTX 4060 MSI',
  price: 1999,
  available: true,
  imageUrl: 'http://example.com/img.jpg'
};

const mockCoupon: GenericCoupon = {
  id: 10,
  store: 'kabum',
  code: 'TECH10',
  discount_value: 10,
  discount_type: 'percent',
  active: 1,
  discovered_at: new Date().toISOString()
};

console.log('--- TESTE 1: Alerta COM cupom batendo no alvo ---');
const alerts1 = evaluateAlerts(mockProduct, mockResult, null, undefined, false, mockCoupon);
alerts1.forEach(a => console.log(a.text));

console.log('\n--- TESTE 2: Alerta SEM cupom (acima do alvo) ---');
const alerts2 = evaluateAlerts(mockProduct, mockResult, null, undefined, false, undefined);
if (alerts2.length === 0) {
  console.log('Nenhum alerta gerado (esperado: preço 1999 > alvo 1850)');
} else {
  alerts2.forEach(a => console.log(a.text));
}

console.log('\n--- TESTE 3: Menor Preço Histórico COM cupom ---');
const mockProductLowest = { ...mockProduct, lowest_price: 2100 };
const alerts3 = evaluateAlerts(mockProductLowest, mockResult, null, undefined, false, mockCoupon);
alerts3.forEach(a => console.log(a.text));

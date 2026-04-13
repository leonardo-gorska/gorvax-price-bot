import { stringSimilarity } from '../utils/confidence';

const expected = 'RTX 4060';
const results = [
  'PC Gamer Pichau Belial, AMD Ryzen 5 5500, GeForce RTX 4060, 16GB DDR4, SSD M.2 480GB',
  'Placa de Video Palit GeForce RTX 4060 Dual, 8GB, GDDR6, 128-bit, NE64060019P1-1070D',
  'Placa de Video Galax GeForce RTX 4060 1-Click OC 2X, 8GB, GDDR6, 128-bit, 46NSL8MD8LOC'
];

console.log('--- TESTE DE SIMILARIDADE ---');
const negativeKeywords = ['pc gamer', 'computador', 'kit upgrade', 'montado', 'configuração'];

for (const res of results) {
  const score = stringSimilarity(res, expected);
  const titleLower = res.toLowerCase();
  const isIrrelevant = negativeKeywords.some(kw => 
    titleLower.includes(kw) && !expected.toLowerCase().includes(kw)
  );
  
  console.log(`\nProduto: ${res}`);
  console.log(`Score: ${score.toFixed(4)}`);
  console.log(`Irrelevante (Neg Keywords): ${isIrrelevant}`);
}

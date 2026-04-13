import { stringSimilarity, isProductRelevant } from '../utils/confidence';

const expected = "rtx 4060";
const samples = [
    { title: "Placa de Vídeo NVIDIA GeForce RTX 4060", expected: true },
    { title: "PC Gamer Completo RTX 4060 Intel Core i5", expected: false }, // PC montado
    { title: "Placa de Vídeo MSI NVIDIA GeForce RTX 3060 Ventus", expected: false }, // Geração anterior (penalidade numérica)
    { title: "Placa de Vídeo Gigabyte NVIDIA GeForce RTX 4060 Ti Gaming OC", expected: true }, // Versão Ti é aceitável
    { title: "Monitor Gamer 144hz para RTX 4060", expected: false }, // Acessório
    { title: "Cabo de Energia para RTX 4060", expected: false }, // Acessorios/Cabos
    { title: "GeForce RTX 4060 Galax 1-click oc", expected: true }
];

console.log(`\n🔍 Verificando Relevância para: "${expected}"\n`);
console.log(`${'PRODUTO'.padEnd(60)} | ${'SCORE'.padEnd(8)} | ${'RELEVANTE?'}`);
console.log('-'.repeat(85));

samples.forEach(s => {
    const score = stringSimilarity(s.title, expected);
    const relevant = isProductRelevant(s.title, expected);
    const status = relevant === s.expected ? '✅' : '❌';
    console.log(`${s.title.padEnd(60)} | ${score.toFixed(3).padEnd(8)} | ${relevant ? 'SIM' : 'NÃO'} ${status}`);
});

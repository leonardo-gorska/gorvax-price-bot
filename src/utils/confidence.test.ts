import { describe, it, expect } from 'vitest';
import { stringSimilarity, evaluateConfidence } from './confidence';

describe('confidence.ts', () => {
  describe('stringSimilarity', () => {
    it('deve retornar 1 para strings identicas', () => {
      expect(stringSimilarity('Placa de Vídeo RTX 4060', 'Placa de Vídeo RTX 4060')).toBe(1);
    });

    it('deve ser case-insensitive e ignorar acentos', () => {
      expect(stringSimilarity('Placa de Vídeo', 'placa de video')).toBe(1);
    });

    it('deve retornar alta similaridade para pequenas variacoes textuais', () => {
      const sim = stringSimilarity('Processador AMD Ryzen 5 5600', 'AMD Ryzen 5 5600 3.5GHz');
      expect(sim).toBeGreaterThan(0.55);
    });

    it('deve retornar baixa similaridade para produtos muito diferentes', () => {
      const sim = stringSimilarity('Placa Mãe B550M', 'Memória RAM 16GB C16');
      expect(sim).toBeLessThan(0.3);
    });
  });

  describe('evaluateConfidence', () => {
    it('deve aprovar produto exatamente igual e mesmo preço', () => {
      const result = evaluateConfidence('RTX 4060 ASUS', 'RTX 4060 ASUS', 1800, 1800);
      expect(result.isReliable).toBe(true);
      expect(result.score).toBe(100);
    });

    it('deve penalizar nomes genéricos estritos', () => {
      const resultKabum = evaluateConfidence('Produto Kabum', 'RTX 4060', 1800, 1800);
      expect(resultKabum.isReliable).toBe(false); // < 50
      expect(resultKabum.score).toBeLessThan(50);

      const resultPichau = evaluateConfidence('Produto Pichau', 'RTX 4060', 1800, 1800);
      expect(resultPichau.isReliable).toBe(false);
      expect(resultPichau.score).toBeLessThan(50);
    });

    it('deve rejeitar uma queda de preço irreal (ex: 80% de queda repentina)', () => {
      const result = evaluateConfidence('RTX 4060 ASUS', 'RTX 4060 ASUS', 300, 1800);
      expect(result.isReliable).toBe(false); // Porque a variação de preço penaliza demais
      expect(result.score).toBeLessThan(50);
      expect(result.reasons).toContainEqual(expect.stringContaining('Variação de preço > 50%'));
    });

    it('deve aprovar pequenas quedas de preço legítimas (ex: 15% de queda)', () => {
      const result = evaluateConfidence('RTX 4060 ASUS', 'RTX 4060 ASUS', 1530, 1800);
      expect(result.isReliable).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(75); // Perde alguns pontos mas passa
    });

    it('deve aprovar se a similaridade de nome for razoável e o preço igual', () => {
      const result = evaluateConfidence('Placa de Vídeo RTX 4060 8GB DUAL', 'RTX 4060 ASUS', 1800, 1800);
      expect(result.isReliable).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });
  });
});

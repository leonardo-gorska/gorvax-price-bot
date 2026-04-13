import { describe, it, expect } from 'vitest';
import { guessCategory } from './categorizer';

describe('categorizer.ts', () => {
  it('deve identificar GPUs corretamente', () => {
    expect(guessCategory('Placa de Vídeo RTX 4060 Ti MSI')).toBe('gpu');
    expect(guessCategory('GPU Radeon RX 7600 Sapphire')).toBe('gpu');
    expect(guessCategory('NVIDIA GeForce GTX 1650')).toBe('gpu');
  });

  it('deve identificar CPUs corretamente e evitar coolers', () => {
    expect(guessCategory('Processador AMD Ryzen 5 5600X')).toBe('cpu');
    expect(guessCategory('Intel Core i5-13600K Processor')).toBe('cpu');
    // Deve ser cooler se tiver cooler no nome
    expect(guessCategory('Cooler para Processador DeepCool AK400')).toBe('cooler');
  });

  it('deve identificar Placas-mãe corretamente', () => {
    expect(guessCategory('Placa-mãe ASUS TUF Gaming B550M-Plus')).toBe('motherboard');
    expect(guessCategory('Gigabyte B650 AORUS ELITE AX')).toBe('motherboard');
  });

  it('deve diferenciar tipos de RAM', () => {
    expect(guessCategory('Memória Kingston Fury Beast 16GB (1x16GB) DDR4')).toBe('ram1x16');
    expect(guessCategory('Memória RAM 32GB (2x16GB) Corsair Vengeance DDR5')).toBe('ram2x16');
    expect(guessCategory('Memória 8GB DDR4 3200MHz')).toBe('ram');
  });

  it('deve identificar SSDs e NVMe', () => {
    expect(guessCategory('SSD Kingston NV2 1TB NVMe M.2 2280')).toBe('nvme');
    expect(guessCategory('SSD Sata 480GB Crucial BX500')).toBe('ssd');
  });

  it('deve identificar fontes (PSU)', () => {
    expect(guessCategory('Fonte Corsair RM750e 750W 80 PLUS Gold')).toBe('psu');
    expect(guessCategory('PSU MSI MAG A650BN 650W')).toBe('psu');
  });

  it('deve identificar monitores e periféricos', () => {
    expect(guessCategory('Monitor Gamer LG ultragear 27" 144hz')).toBe('monitor');
    expect(guessCategory('Mouse Logitech G Pro X Superlight')).toBe('mouse');
    expect(guessCategory('Teclado Mecânico Keychron V1')).toBe('keyboard');
  });

  it('deve retornar "other" para produtos desconhecidos', () => {
    expect(guessCategory('Papel Higiênico Folha Dupla')).toBe('other');
  });
});

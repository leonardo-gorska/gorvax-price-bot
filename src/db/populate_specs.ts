import { listActiveProducts, upsertComponentSpecs } from './queries';
import { logger } from '../utils/logger';

/**
 * Popula a tabela component_specs baseada nos nomes dos produtos do seed.
 * Isso permite que o simulador de build funcione imediatamente.
 */
export function populateInitialSpecs(): void {
  const products = listActiveProducts();
  let count = 0;

  for (const p of products) {
    if (!p.name) continue;
    const name = p.name.toUpperCase();
    const specs: any = { product_id: p.id };

    // --- CPUs ---
    if (p.category === 'cpu') {
      if (name.includes('AM5') || name.includes('7500F') || name.includes('7600') || name.includes('7700') || name.includes('7800') || name.includes('9600') || name.includes('9700')) {
        specs.socket = 'AM5';
      }
      if (name.includes('7800X3D') || name.includes('7900')) specs.tdp_watts = 120;
      else specs.tdp_watts = 65;
    }

    // --- Motherboards ---
    if (p.category === 'motherboard') {
      if (name.includes('B650') || name.includes('X670') || name.includes('A620')) {
        specs.socket = 'AM5';
        specs.memory_type = 'DDR5';
      }
      if (name.includes('M-')) specs.form_factor = 'mATX';
      else specs.form_factor = 'ATX';
    }

    // --- RAM ---
    if (p.category.startsWith('ram')) {
      if (name.includes('DDR5')) specs.memory_type = 'DDR5';
      if (name.includes('DDR4')) specs.memory_type = 'DDR4';
    }

    // --- GPUs ---
    if (p.category === 'gpu') {
      if (name.includes('16GB')) specs.vram_gb = 16;
      else if (name.includes('12GB')) specs.vram_gb = 12;
      else if (name.includes('8GB')) specs.vram_gb = 8;
      
      if (name.includes('4070') || name.includes('7800')) specs.tdp_watts = 250;
      else if (name.includes('4060') || name.includes('7600')) specs.tdp_watts = 160;
    }

    // --- PSUs ---
    if (p.category === 'psu') {
      const wattMatch = name.match(/(\d+)W/);
      if (wattMatch) specs.psu_watts = parseInt(wattMatch[1]);
    }

    // --- SSD/NVMe ---
    if (p.category === 'nvme') {
      if (name.includes('4.0') || name.includes('GEN4')) specs.nvme_gen = 4;
      else if (name.includes('5.0') || name.includes('GEN5')) specs.nvme_gen = 5;
      else specs.nvme_gen = 3;
    }

    if (Object.keys(specs).length > 1) {
      upsertComponentSpecs(p.id, specs);
      count++;
    }
  }

  logger.info({ count }, '✅ Especificações técnicas iniciais populadas');
}

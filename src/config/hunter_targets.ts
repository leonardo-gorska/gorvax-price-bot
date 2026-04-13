import { HunterTarget } from '../types';

/**
 * Lista de componentes que o Caçador Automático monitora globalmente.
 * foca em itens de alta demanda onde variações de preço são comuns e outliers são valiosos.
 */
export const HUNTER_TARGETS: HunterTarget[] = [
  // GPUs NVIDIA
  { query: 'RTX 4060', category: 'gpu', keywords: ['4060', '8GB'] },
  { query: 'RTX 4060 Ti', category: 'gpu', keywords: ['4060', 'Ti'] },
  { query: 'RTX 4070', category: 'gpu', keywords: ['4070'] },
  { query: 'RTX 4070 Super', category: 'gpu', keywords: ['4070', 'Super'] },

  // GPUs AMD
  { query: 'RX 7600', category: 'gpu', keywords: ['7600', '8GB'] },
  { query: 'RX 7600 XT', category: 'gpu', keywords: ['7600', 'XT', '16GB'] },
  { query: 'RX 7700 XT', category: 'gpu', keywords: ['7700', 'XT'] },
  { query: 'RX 7800 XT', category: 'gpu', keywords: ['7800', 'XT'] },
  { query: 'RX 6750 XT', category: 'gpu', keywords: ['6750', 'XT'] },

  // CPUs AMD AM5
  { query: 'Ryzen 5 7600', category: 'cpu', keywords: ['7600'] },
  { query: 'Ryzen 5 7600X', category: 'cpu', keywords: ['7600X'] },
  { query: 'Ryzen 7 7700', category: 'cpu', keywords: ['7700'] },
  { query: 'Ryzen 7 7800X3D', category: 'cpu', keywords: ['7800X3D'] },
  { query: 'Ryzen 5 8600G', category: 'cpu', keywords: ['8600G'] },

  // Outros (PSU, NVMe, RAM)
  { query: 'XPG Core Reactor 850W', category: 'psu', keywords: ['Core Reactor', '850W'] },
  { query: 'Kingston NV2 1TB', category: 'nvme', keywords: ['NV2', '1TB'] },
  { query: 'WD Black SN770 1TB', category: 'nvme', keywords: ['SN770', '1TB'] },
  { query: 'Memória RAM 16GB DDR4 3200MHz', category: 'ram', keywords: ['16GB', 'DDR4', '3200'] },
  { query: 'Memória RAM 16GB DDR5 5200MHz', category: 'ram', keywords: ['16GB', 'DDR5', '5200'] },
  { query: 'Memória RAM 32GB DDR5 6000MHz', category: 'ram', keywords: ['32GB', 'DDR5', '6000'] },
];


// ============================================
// Bot — Inline Keyboards
// ============================================

import { InlineKeyboard } from 'grammy';
import type { Product } from '../types';
import { categoryEmoji } from '../utils/format';

/** Keyboard de confirmação */
export function confirmKeyboard(action: string, id: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('✅ Sim', `${action}_confirm_${id}`)
    .text('❌ Não', `${action}_cancel_${id}`);
}

/** Keyboard de ações do produto */
export function productActionsKeyboard(productId: number, isWatchlist: number = 0): InlineKeyboard {
  const watchlistLabel = isWatchlist ? '⚙️ Mover para Setup' : '👁️ Mover para Watchlist';
  return new InlineKeyboard()
    .text('🔄 Checar Agora', `check_${productId}`)
    .text('📊 Histórico', `history_${productId}`)
    .row()
    .text('🎯 Definir Alerta', `setalert_${productId}`)
    .text(watchlistLabel, `toggle_watchlist_${productId}`)
    .row()
    .text('🗑️ Remover', `remove_${productId}`);
}

/** Keyboard de categorias */
export function categoriesKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  const categories = [
    { emoji: '🧠', label: 'CPUs', value: 'cpu' },
    { emoji: '🕹️', label: 'GPUs', value: 'gpu' },
    { emoji: '🔌', label: 'Placas-Mãe', value: 'motherboard' },
    { emoji: '💾', label: 'RAM 1x16', value: 'ram1x16' },
    { emoji: '💾', label: 'RAM 2x16', value: 'ram2x16' },
    { emoji: '💿', label: 'SSD', value: 'ssd' },
    { emoji: '⚡', label: 'NVMe', value: 'nvme' },
    { emoji: '🔋', label: 'Fontes', value: 'psu' },
    { emoji: '🖥️', label: 'Gabinetes', value: 'case' },
    { emoji: '❄️', label: 'Coolers', value: 'cooler' },
    { emoji: '🖵', label: 'Monitores', value: 'monitor' },
    { emoji: '⌨️', label: 'Periféricos', value: 'peripheral' },
    { emoji: '💺', label: 'Cadeiras', value: 'chair' },
    { emoji: '🔧', label: 'Acessórios', value: 'other' },
    { emoji: '📦', label: 'Todos', value: 'all' },
  ];

  for (let i = 0; i < categories.length; i += 2) {
    const c1 = categories[i];
    const c2 = categories[i + 1];
    if (c2) {
      kb.text(`${c1.emoji} ${c1.label}`, `cat_${c1.value}`)
        .text(`${c2.emoji} ${c2.label}`, `cat_${c2.value}`)
        .row();
    } else {
      kb.text(`${c1.emoji} ${c1.label}`, `cat_${c1.value}`).row();
    }
  }

  return kb;
}

/** Keyboard de paginação para lista de produtos */
export function paginationKeyboard(
  page: number,
  totalPages: number,
  prefix: string
): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (page > 1) {
    kb.text('⬅️ Anterior', `${prefix}_page_${page - 1}`);
  }
  kb.text(`${page}/${totalPages}`, 'noop');
  if (page < totalPages) {
    kb.text('Próximo ➡️', `${prefix}_page_${page + 1}`);
  }
  return kb;
}

/** Keyboard para resultados de busca (Fase 7.5) */
export function searchResultKeyboard(results: any[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  // Adiciona botões para os top 5 resultados
  results.slice(0, 5).forEach((r, i) => {
    const label = `${i + 1}️⃣ Monitorar na ${r.store}`;
    kb.text(label, `monitor_search_${i}`).row();
  });
  return kb;
}

/** Keyboard para alertas de preço (Fase 7.5) */
export function alertActionsKeyboard(productId: number, url: string): InlineKeyboard {
  return new InlineKeyboard()
    .url('🛒 Ir para loja', url)
    .text('📊 Histórico', `history_${productId}`)
    .row()
    .text('🎯 Auto-Target', `autotarget_${productId}`)
    .text('⏸️ Silenciar', `deactivate_${productId}`);
}

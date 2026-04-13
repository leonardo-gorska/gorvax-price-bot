import { initDatabase, getDatabase } from '../db/index';
import { listAllActiveProducts, updateProductGroupId, getProductById } from '../db/queries';
import { performCrossStoreSearch } from '../services/crossSearch';
import { logger } from '../utils/logger';

/**
 * Script para agrupar produtos similares automaticamente.
 */
async function autoGroup() {
  logger.info('🔍 Iniciando Agrupamento Automático de Produtos...');
  initDatabase();

  const products = listAllActiveProducts();
  const ungrouped = products.filter(p => !p.group_id);

  logger.info({ total: ungrouped.length }, '📦 Produtos sem grupo encontrados');

  for (const product of ungrouped) {
    try {
      if (!product.name || product.name === 'Sem nome') continue;

      logger.info({ id: product.id, name: product.name }, '🔎 Buscando similares para agrupamento...');
      
      const category = product.category as any;
      const results = await performCrossStoreSearch(product.name, category, product.store);

      // Filtra apenas resultados com similaridade muito alta (> 0.85) para evitar agrupamento errado
      const matches = results.filter(r => r.similarity >= 0.85);

      if (matches.length > 0) {
        // Gera um group_id persistente baseado no nome "limpo" do primeiro produto
        const groupId = `group_${product.id}_${Date.now()}`;
        
        logger.info({ id: product.id, group: groupId, matches: matches.length }, '🔗 Criando novo grupo');

        // Atribui o group_id ao produto base
        updateProductGroupId(product.id, groupId);

        // Busca e atribui o group_id para as correspondências se elas já estiverem no banco
        // (Ou poderíamos adicionar como novos produtos, mas aqui o foco é agrupar os existentes)
        for (const match of matches) {
          // Verifica se o match.url já existe no banco
          const db = getDatabase();
          const existing = db.prepare('SELECT id FROM products WHERE url = ?').get(match.url) as { id: number } | undefined;
          
          if (existing) {
            updateProductGroupId(existing.id, groupId);
            logger.debug({ productId: existing.id, group: groupId }, '✅ Produto existente agrupado');
          }
        }
      }
    } catch (err: any) {
      logger.error({ id: product.id, error: err.message }, '❌ Erro ao processar agrupamento para produto');
    }
  }

  logger.info('✅ Fim do processamento de agrupamento.');
  process.exit(0);
}

autoGroup().catch(err => {
  console.error(err);
  process.exit(1);
});

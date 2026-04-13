import { addProduct, listProductsByGroupId } from '../db/queries';
import { logger } from '../utils/logger';

async function verify() {
  logger.info('Iniciando verificação de integração (Phase 10.1)...');
  
  try {
    // 1. Adiciona um produto com group_id
    const groupId = `test_group_${Date.now()}`;
    const p1 = addProduct({
      url: `https://www.kabum.com.br/test-10-1-${Date.now()}`,
      store: 'kabum',
      category: 'cpu',
      name: 'AMD Ryzen 5 7600 Test',
      group_id: groupId
    });
    
    logger.info({ id: p1.id, groupId: p1.group_id }, 'Produto 1 adicionado');
    
    // 2. Adiciona outro produto com o mesmo group_id (simulando auto-add)
    const p2 = addProduct({
      url: `https://www.pichau.com.br/test-10-1-${Date.now()}`,
      store: 'pichau',
      category: 'cpu',
      name: 'Processador AMD Ryzen 5 7600 Simulado',
      group_id: groupId
    });
    
    logger.info({ id: p2.id, groupId: p2.group_id }, 'Produto 2 (auto-add) adicionado');
    
    // 3. Verifica se ambos estão no mesmo grupo
    const group = listProductsByGroupId(groupId);
    logger.info({ groupSize: group.length }, 'Verificando grupo de produtos');
    
    if (group.length === 2 && group[0].group_id === groupId && group[1].group_id === groupId) {
      logger.info('✅ Verificação de integração concluída com sucesso!');
    } else {
      logger.error({ found: group.length }, '❌ Falha na verificação de integração: número de produtos incorreto no grupo');
      process.exit(1);
    }
  } catch (err) {
    logger.error({ error: (err as Error).message }, 'Erro durante verificação');
    process.exit(1);
  }
}

verify();

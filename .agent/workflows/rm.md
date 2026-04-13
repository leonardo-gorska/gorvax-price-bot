---
description: Executar o próximo item pendente do ROADMAP do GorvaxBot
---

# Workflow: Executar Próximo Item do ROADMAP

## Passos

1. Leia o arquivo `ROADMAP.md` na raiz do projeto:
```
Leia c:\Users\Gorska\Desktop\Chat Bot Promo\ROADMAP.md
```

2. Identifique o PRIMEIRO item com `[ ]` (pendente) na ordem do documento

3. Implemente o item identificado:
   - Faça as alterações de código necessárias
   - Teste se compila corretamente com `npx tsc --noEmit`
   - Se possível, rode os testes com `npm test`

4. Após implementar, atualize o ROADMAP.md:
   - Mude o item de `[ ]` para `[x]`
   - Atualize o campo "Última Atualização" com a data atual
   - Atualize a tabela de métricas de conclusão no final

5. Repita os passos 2-4 até que todos os itens da FASE atual estejam concluídos, ou até atingir o limite de contexto

6. Ao finalizar a sessão, notifique o usuário sobre o que foi implementado

# 🚀 GorvaxBot - ROADMAP

**Status Atual**: ✅ OPERACIONAL — Fase 11 (Excelência em Scrappers) em andamento.
**Última Atualização**: 20/03/2026

---

## 📋 PRÓXIMOS PASSOS: FASE 11 (Excelência em Scrappers)

### 1. Estabilidade e Multi-Loja [x]
- [x] Centralizar debug files de scripts (`test-amazon`, etc) em `data/logs/debug/`.
- [x] Corrigir extração de resultados de busca no **Amazon** (fixar "Produto Amazon").
- [x] Melhorar suporte a variações (cor/voltagem) no **Magazine Luiza**. <!-- id: 13 -->
- [x] Aprimorar detecção de bloqueio e fallbacks no **Shopee**.

### 2. Expansão de Features [x]
- [x] Adicionar suporte a **Mercado Livre** no sistema de monitoramento de alertas. <!-- id: 25 -->
- [x] Implementar histórico de preços visual no Dashboard. <!-- id: 26 -->

---

## ✅ CONCLUÍDO: FASE 10 (Estabilidade e Infraestrutura)

### 1. Implementação de Comandos Anunciados [x]
- [x] Criar comando `/promos` (Integração com Pelando via `scrapePelando`).
- [x] Criar comando `/alert_percent` (Alerta baseado em porcentagem de queda).
- [x] Criar comando `/export` (Exportação de CSV para Admin).

### 2. Polimento e UX [x]
- [x] Sincronizar `/start` e `/tutorial` com a realidade dos comandos.
- [x] Melhorar feedback visual dos alertas de cupom.

---

## ✅ CONCLUÍDO: FASE 8 (Inteligência Avançada)

### 1. Centralização da Inteligência de Relevância [x]
- [x] Unificar lógica de filtragem (neg Keywords, chipset mismatch, model match).
- [x] Aplicar `isProductRelevant` consistentemente em todos os scrapers.
- [x] Reduzir falsos positivos (Pichau e Amazon).

### 2. Melhoria na Categorização Automática [x]
- [x] Suporte a Regex avançado em `categorizer.ts`.
- [x] Diferenciação de componentes similares (ex: RAM Desktop vs Laptop).

---

## ✅ BUGS RESOLVIDOS (Histórico)

### 1. Dashboard Online (Resolvido)
- **O que foi feito**: Porta alterada para **3001** no `src/config.ts` e `dashboard/src/lib/api.ts`.
- **Status**: ✅ FUNCIONAL

### 2. Alertas Lentos e Confusos (Resolvido)
- **O que foi feito**: 
    - Prioridade para imagens originais do scraper em vez de gráficos. 
    - Mensagens agora distinguem quedas no site de descontos via cupom. 
    - Removido o spam de `1.699 > 1.699 (-20%)`.
- **Status**: ✅ FUNCIONAL

### 3. Itens Ignorados (Resolvido)
- **O que foi feito**: 
    - Refinada a normalização no `confidence.ts` para não remover "gamer" e "fonte".
    - Threshold de busca no Kabum e Pichau ajustado para capturar mais itens relevantes.
- **Status**: ✅ FUNCIONAL

### 4. Limpeza de Logs e Estabilidade (Extras)
- **O que foi feito**: 
    - Removidas 2 inscrições fantasma (ID 999999999) que causavam erros.
    - Adicionado timeout de 60s nos scrapers para evitar jobs travados.
    - Implementado comando `/build` para visão geral do custo do setup.

---

## 📋 PRÓXIMOS PASSOS: FASE 10 (Estabilidade e Infraestrutura)

### 1. Centralização e Limpeza de Artefatos [x]
- [x] Redirecionar screenshots e HTML de debug para `data/logs/debug/`.
- [x] Implementar limpeza automática de arquivos antigos (>3 dias) no Scheduler.

### 2. Otimização de Performance [x]
- [x] Ajustar timeouts e retries específicos para Amazon e Terabyte.
- [x] Investigar redução de consumo de CPU no processamento de imagens (Screenshots Above-the-fold).

---

## 📅 Histórico de Auditoria
- **2026-03-19**: Finalização da Fase 9. Início da Fase 10 para organização de logs e estabilidade.
- **2026-03-19**: Implementação de timeouts/retries específicos (Amazon/Tera) e redução de CPU em screenshots.
- **2026-03-19**: Finalização de todas as fases de correção. Bot testado e logs estabilizados.
- **2026-03-19**: Centralização de arquivos de debug de scripts em `data/logs/debug/` e limpeza da raiz.
- **2026-03-19**: Correção do scraper da Amazon, eliminando o fallback "Produto Amazon" e melhorando extração via Puppeteer.
- **2026-03-19**: Melhoria no scraper da Magalu: correção de extração de preço via `item.offers` e detecção de disponibilidade em todas as variações.
- **2026-03-19**: Aprimorada a detecção de bloqueio na Shopee (strings de login/captcha) e implementado fallback de busca por nome.
- **2026-03-20**: Implementação completa do histórico de preços visual no dashboard (Novos gráficos premium, indicadores de tendência e atividade global na Home).

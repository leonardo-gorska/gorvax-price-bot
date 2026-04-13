---
description: Como adicionar um novo produto para monitoramento
---

# Adicionar Produto

## Via Telegram
1. Abra o chat com `@GorvaxBot`
2. Envie: `/add <url do produto>`

### Exemplo:
```
/add https://www.kabum.com.br/produto/123456/processador-amd-ryzen-5-7500f
```

## Lojas suportadas:
- 🟠 **Kabum** — kabum.com.br
- 🔵 **Pichau** — pichau.com.br
- 🟢 **Terabyte** — terabyteshop.com.br
- 🟡 **Amazon BR** — amazon.com.br
- 🟣 **Mercado Livre** — mercadolivre.com.br
- 🔴 **Magazine Luiza** — magazineluiza.com.br

## Definir alerta de preço
Após adicionar, defina um preço alvo:
```
/alert <id> <preço>
```
Exemplo: `/alert 5 1300`

## Carregar produtos do setup PC
Use `/setup` para carregar automaticamente todos os produtos pré-configurados (CPUs, GPUs, RAM, etc.)

## Via código (seed.ts)
Para adicionar produtos em massa, edite `src/db/seed.ts` e adicione novas entradas no array `SEED_PRODUCTS`.

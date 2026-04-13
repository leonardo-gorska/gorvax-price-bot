---
description: Como iniciar o bot de rastreamento de preços
---

# Iniciar o Bot

## Pré-requisitos
1. Node.js 20+ instalado
2. Token do Telegram Bot configurado no `.env`

## Passos

// turbo
1. Instalar dependências (se ainda não instalou):
```
npm install
```

// turbo
2. Rodar em modo de desenvolvimento (com hot reload):
```
npm run dev
```

3. Abra o Telegram e envie `/start` para o bot `@GorvaxBot`

4. Use `/setup` para carregar os produtos do setup do PC

5. Use `/checkall` para fazer a primeira checagem de preços

## Parar o bot
- Pressione `Ctrl+C` no terminal

## Modo produção
```
npm run build
npm start
```

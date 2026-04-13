---
description: Como fazer deploy do bot para rodar 24/7
---

# Deploy do Bot (24/7)

## Opção 1: Rodar no próprio PC (mais simples)

### Usando PM2 (processo em background)

// turbo
1. Instalar PM2 globalmente:
```
npm install -g pm2
```

// turbo
2. Buildar o projeto:
```
npm run build
```

// turbo
3. Iniciar com PM2:
```
pm2 start dist/index.js --name gorvax-bot
```

// turbo
4. Salvar para iniciar automaticamente com o Windows:
```
pm2 save
pm2 startup
```

### Comandos PM2 úteis:
```
pm2 status          # Ver status
pm2 logs gorvax-bot # Ver logs
pm2 restart gorvax-bot  # Reiniciar
pm2 stop gorvax-bot     # Parar
```

---

## Opção 2: VPS gratuita (Oracle Cloud Free Tier)

1. Crie uma conta na Oracle Cloud (100% free tier)
2. Crie uma instância ARM (até 4 vCPUs, 24GB RAM — GRÁTIS)
3. Instale Node.js 20+
4. Clone o projeto
5. Configure o `.env`
6. Use PM2 conforme acima

---

## Opção 3: Railway / Render (grátis com limitações)

- **Railway**: 500h/mês grátis. Deploy via GitHub.
- **Render**: Free tier com sleep após 15min inatividade.

Para bots Telegram, Railway é a melhor opção gratuita.

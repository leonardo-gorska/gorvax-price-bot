# 🤖 GorvaxBot — Rastreador de Preços de Hardware

Bot para Telegram que monitora automaticamente os preços de peças de PC nas principais lojas brasileiras e envia alertas quando o preço cai.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## O que faz

- **Monitora 6 lojas** — Kabum, Pichau, Terabyte, Amazon BR, MercadoLivre e Magazine Luiza
- **Web scraping stealth** — Puppeteer com rotação de User-Agent para evitar bloqueio
- **Alertas automáticos** — Notifica via Telegram quando o preço cai
- **Histórico de preços** — Armazena variações em SQLite com WAL
- **Comparação entre lojas** — Encontra o menor preço entre todas as lojas
- **Export CSV** — Exporta todos os dados para análise

## Stack

| Tecnologia | Uso |
|-----------|-----|
| **TypeScript 5.9** | Strict mode, tipagem completa |
| **Grammy** | Framework para Telegram Bot API |
| **Puppeteer Extra** | Web scraping com plugin stealth |
| **Cheerio** | Parser HTML para extração de dados |
| **better-sqlite3** | Banco de dados local com WAL |
| **Pino** | Logging estruturado (stdout + arquivo) |
| **Zod** | Validação de variáveis de ambiente |
| **Vitest** | Testes automatizados |
| **Docker** | Containerização para deploy |

## Arquitetura

```
src/
├── bot/           # Comandos Telegram + middleware (auth, rate limit, logger)
├── scrapers/      # Scrapers individuais por loja + orquestrador
├── db/            # Conexão, schema, migrações e queries
├── scheduler/     # Cron jobs (4x/dia + manutenção)
├── utils/         # Formatação, sanitização, logging
├── config.ts      # Validação de env com Zod
└── index.ts       # Entry point
```

## Segurança

- Autenticação por Chat ID (bot restrito ao dono)
- Rate limiting de 20 comandos/minuto
- Validação de URLs contra SSRF
- Dead link detection (desativa produtos com 10+ falhas)
- Exponential backoff em falhas de scraping

## Como rodar

```bash
# 1. Configurar
cp .env.example .env
# Edite .env com seu token do @BotFather

# 2. Instalar e rodar
npm install
npm run dev

# Ou via Docker
docker-compose up -d
```

## Licença

MIT

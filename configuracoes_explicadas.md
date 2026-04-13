# ⚙️ Configurações Explicadas

Este documento detalha o que está configurado no GorvaxBot, os valores atuais e o **porquê** de cada decisão técnica.

---

## 📄 Arquivo `.env` (Variáveis de Ambiente)

| Variável | Valor Padrão | Por que existe? |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | `-` | Necessário para o bot se comunicar com os servidores do Telegram. |
| `TELEGRAM_CHAT_ID` | `-` | Garante que o bot envie alertas **apenas para você**, evitando que estranhos usem seus recursos. |
| `CRON_SCHEDULE` | `0 */6 * * *` | Configurado para checar preços 4 vezes ao dia. Esse intervalo evita que as lojas bloqueiem seu IP por excesso de acessos. |
| `REDIS_URL` | `redis://localhost:6379` | O Redis gerencia a fila de tarefas. Se o bot travar, o Redis garante que ele saiba exatamente onde parou. |
| `DASHBOARD_PORT` | `3001` | Porta onde a API interna e o painel de filas rodam. |

---

## 🕵️ Estratégias de Scraping (Por que não somos bloqueados?)

No arquivo `src/config.ts`, definimos parâmetros para simular um comportamento humano:

*   **User-Agent Rotation**: O bot alterna entre identidades (Chrome em Windows, Mac, Linux) a cada acesso. Isso impede que a loja perceba que é o mesmo sistema acessando sempre.
*   **Stealth Mode**: Utilizamos o plugin `puppeteer-extra-plugin-stealth`. Ele oculta características técnicas do navegador que sites como a Terabyte usam para identificar robôs.
*   **Delay com Jitter**: Entre um produto e outro, o bot espera um tempo aleatório (ex: 4 a 8 segundos). Acessos com tempos fixos (ex: exatamente a cada 5s) são facilmente identificados como bots.

---

## 📦 Gestão de Dados e Memória

*   **HISTORY_RETENTION_DAYS (90 dias)**: Mantemos o histórico de preço por 3 meses. Mais que isso tornaria o banco de dados lento e o gráfico de preços difícil de ler.
*   **MAX_CONSECUTIVE_FAILURES (10)**: Se um link falha 10 vezes seguidas, o bot o desativa. Isso acontece se o produto saiu de linha ou o link quebrou, economizando seu processamento.
*   **MAX_RAM_MB (300MB)**: O navegador Chrome consome muita memória. Se o bot detectar que o processo passou de 300MB, ele reinicia o navegador automaticamente para manter seu PC rápido.

---

## 🗄️ Banco de Dados (SQLite)

*   **Por que SQLite?**: É um arquivo único (`promo.db`), extremamente rápido para uso pessoal e não exige um servidor pesado de banco de dados instalado.
*   **WAL Mode**: Habilitamos o *Write-Ahead Logging*, que permite que o bot leia dados (ex: você dando um `/list`) enquanto ele está salvando novos preços, sem travar o sistema.

---

## 🏗️ Como o Bot Funciona (Arquitetura)

O GorvaxBot não é apenas um script simples; é um sistema coordenado:

1.  **Agendador (Scheduler)**: O "relógio" do sistema. Ele decide quando é hora de verificar os preços com base na sua configuração de `CRON_SCHEDULE`.
2.  **Scrapers (src/scrapers)**: Os "espiões". Cada loja (Amazon, Mercado Livre, etc.) tem seu próprio scraper que sabe exatamente onde encontrar o preço e o título na página, contornando bloqueios.
3.  **Banco de Dados (SQLite)**: A "memória". Salva o preço atual e mantém o histórico para gerar os gráficos.
4.  **Serviço de Alerta**: O "vigia". Compara o preço novo com o anterior ou com o seu valor alvo. Se cair, ele dispara o gatilho.
5.  **Telegram Bot API**: O "mensageiro". Envia a notificação formatada com foto e botões para o seu celular.

## 🤖 Por que usar um Bot do Telegram (e não uma conta pessoal)?

Você pode se perguntar: *"Por que não usamos minha própria conta para mandar as mensagens?"*

*   **Automação Real**: Um Bot é feito para máquinas. Ele responde instantaneamente 24h por dia, sem precisar que um aplicativo esteja aberto no seu PC ou celular o tempo todo.
*   **Recursos Premium**: Bots têm botões interativos, menus e teclados customizados que facilitam a navegação (como o nosso menu de `/start`).
*   **Segurança contra Banimento**: Usar uma conta pessoal para enviar mensagens automáticas em massa viola os Termos de Serviço do Telegram e resultaria no banimento da sua conta. O Bot API é o caminho oficial e seguro.
*   **Escalabilidade**: O Bot pode enviar centenas de alertas simultâneos para diferentes canais ou grupos sem esforço.

---

## 🤝 Nosso Papel vs Papel do Telegram

| O Que Nós Fazemos (O "Cérebro") | O Que o Telegram Faz (O "Correio") |
| :--- | :--- |
| **Scraping**: Ir nas lojas e ler os preços. | **Entrega**: Garantir que a mensagem chegue no seu celular. |
| **Lógica**: Decidir se o preço baixou ou não. | **Interface**: Mostrar o chat, as fotos e os botões. |
| **Armazenamento**: Guardar o histórico de meses. | **Notificação**: Tocar o som e mostrar o alerta na tela. |
| **Gestão**: Adicionar, remover e listar seus produtos. | **Criptografia**: Proteger a conversa entre o Bot e você. |

---

## 🌐 Endereços Locais (Localhost)

Se você estiver rodando o bot na sua máquina, pode acessar essas interfaces pelo navegador:

1.  **Dashboard Visual (Next.js)**: `http://localhost:3000`
    *   Interface premium para ver os gráficos de preço e a lista de produtos com fotos.
2.  **Painel de Filas (BullMQ Admin)**: `http://localhost:3001/admin/queues`
    *   Onde você vê o bot "trabalhando" em tempo real (quais sites ele está visitando agora).
3.  **API de Dados**: `http://localhost:3001/api/products`
    *   Dados crus de todos os seus produtos em formato JSON.

> [!NOTE]
> O usuário padrão é `admin` e a senha padrão é `gorvax123` (configuráveis no `.env`).



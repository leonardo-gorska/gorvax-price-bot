# 📖 Manual do GorvaxBot — Monitor de Preços Enterprise

Bem-vindo ao manual oficial do **GorvaxBot**! Este documento explica como utilizar cada função do bot e como gerenciar seu setup.

---

## 🚀 Como Iniciar

1.  **Pré-requisito**: Certifique-se de que o **Redis** está rodando no seu computador.
2.  **Scripts**:
    *   `iniciar_bot.bat`: Abre o bot e o painel web em janelas separadas.
    *   `parar_bot.bat`: Encerra tudo com segurança e libera a memória RAM.

---

## 🤖 Comandos do Telegram

Envie estes comandos para o @GorvaxBot no Telegram:

### Gerenciamento de Produtos
*   `/start`: Exibe as boas-vindas e comandos básicos.
*   `/setup`: **(Recomendado)** Carrega automaticamente mais de 150 produtos pré-configurados (CPUs, GPUs, Placas-mãe, etc.).
*   `/search <nome>`: **(Novo! 🔥)** Procura um produto pelo nome em todas as lojas simultaneamente. Você pode clicar no botão de monitorar diretamente nos resultados!
*   `/add <url>`: Adiciona um link manual para monitoramento. Suporta Kabum, Pichau, Terabyte, Amazon, Mercado Livre e Magalu.
*   `/remove <id>`: Para de monitorar um produto específico.
*   `/list`: Lista todos os produtos que você está monitorando (com paginação).
*   `/categories`: Filtra seus produtos por categorias (ex: Processadores, Placas de Vídeo).

### Monitoramento e Alertas
*   `/check <id>`: Força uma checagem de preço imediata para um item.
*   `/checkall`: Força a checagem de todos os produtos da sua lista (pode demorar alguns minutos).
*   `/alert <id> <preço>`: Define um preço-alvo. O bot te enviará uma notificação urgente quando o item chegar nesse valor.
*   `/history <id>`: Gera um gráfico de variação de preço dos últimos dias.

### Utilidades e Status
*   `/status`: Mostra se o bot está online, o uptime e o uso de memória.
*   `/health`: Mostra a "saúde" das lojas (quais estão bloqueando o bot ou funcionando 100%).
*   `/compare`: Compara preços do mesmo item entre diferentes lojas.
*   `/export`: Exporta toda a sua base de dados para um arquivo CSV.
*   `/tutorial`: Exibe este manual resumido dentro do Telegram.

---

## 📊 Dashboards e Painéis

O GorvaxBot possui dois painéis de controle principais acessíveis via navegador:

### 1. Dashboard de Fila (BullMQ) 
**URL**: `http://localhost:3000/admin/queues`  
**O que faz**: Mostra as tarefas de monitoramento agendadas, erros de rede e permite repetir tarefas que falharam.
*   **Login Padrão**: `admin`
*   **Senha Padrão**: `gorvax123` (pode ser alterada no `.env`)

### 2. Dashboard Web (Next.js)
**URL**: `http://localhost:3000/api/stats` (API) ou a interface visual em porta automática.  
**O que faz**: Uma interface moderna para ver estatísticas, produtos mais baratos de hoje e histórico visual.

---

## 💡 Dicas de Uso

*   **Evite Spam**: O bot checa preços automaticamente a cada 6 horas. Use o `/checkall` apenas se necessário.
*   **Links Diretos**: O bot funciona muito melhor com URLs diretas de produtos do que com links de busca.
*   **RAM**: Se sentir o computador lento, use o `parar_bot.bat`, ele garante que nenhum processo fantasma do Chrome fique aberto.

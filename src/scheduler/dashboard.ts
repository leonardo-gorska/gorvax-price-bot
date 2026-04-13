import express from 'express';
import cors from 'cors';
const basicAuth = require('express-basic-auth');
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Server } from 'http';
import { jobQueue } from './queue';
import { getConfig } from '../config';
import { logger } from '../utils/logger';
import { getDatabase } from '../db';

let server: Server | null = null;

/**
 * Inicializa o servidor Express para o Dashboard do BullMQ e API REST
 */
export async function startDashboard(): Promise<void> {
  const config = getConfig();
  const db = getDatabase();
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(jobQueue)],
    serverAdapter: serverAdapter,
  });

  const app = express();
  app.use(cors()); // Permite acesso cross-origin
  app.use(express.json());

  // Segurança simples (Basic Auth) para Dashboard e API
  const authMiddleware = basicAuth({
    users: { [config.DASHBOARD_USER]: config.DASHBOARD_PASSWORD },
    challenge: true,
    realm: 'GorvaxBot Admin Panel',
  });

  app.use('/admin/queues', authMiddleware, serverAdapter.getRouter());

  // ─── API REST Mínima ───────────────────────

  const apiRouter = express.Router();
  apiRouter.use(authMiddleware);

  /** Listagem de todos os produtos */
  apiRouter.get('/products', (req, res) => {
    try {
      const products = db.prepare(`
        SELECT p.*, 
               (SELECT COUNT(*) FROM price_history ph WHERE ph.product_id = p.id) as history_count 
        FROM products p 
        ORDER BY p.category, p.name
      `).all();
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /** Estatísticas globais */
  apiRouter.get('/stats', (req, res) => {
    try {
      const stats = {
        total_products: db.prepare('SELECT COUNT(*) as count FROM products').get() as any,
        active_products: db.prepare('SELECT COUNT(*) as count FROM products WHERE active = 1').get() as any,
        watchlist_items: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_watchlist = 1').get() as any,
        total_price_entries: db.prepare('SELECT COUNT(*) as count FROM price_history').get() as any,
        last_check: db.prepare('SELECT MAX(last_checked_at) as last FROM products').get() as any,
        // Atividade recente para o gráfico global (últimas 30 mudanças significativas)
        recent_activity: db.prepare(`
          SELECT ph.price, ph.checked_at, p.name as product_name 
          FROM price_history ph
          JOIN products p ON ph.product_id = p.id
          ORDER BY ph.checked_at DESC
          LIMIT 30
        `).all(),
      };
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /** Histórico e detalhes de um produto específico */
  apiRouter.get('/products/:id', (req, res) => {
    const { id } = req.params;
    try {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!product) return res.status(404).json({ success: false, error: 'Produto não encontrado' });

      const history = db.prepare(`
        SELECT price, available, checked_at 
        FROM price_history 
        WHERE product_id = ? 
        ORDER BY checked_at DESC 
        LIMIT 100
      `).all(id);

      res.json({ success: true, data: { ...product, history } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use('/api', apiRouter);

  // Interface Simples na Raiz
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GorvaxBot Dashboard</title>
          <style>
            body { font-family: sans-serif; padding: 40px; background: #f0f2f5; color: #1c1e21; text-align: center; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: inline-block; }
            h1 { color: #007bff; }
            a { display: block; margin: 10px; color: #007bff; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🤖 GorvaxBot Dashboard</h1>
            <p>Selecione uma opção abaixo:</p>
            <a href="/admin/queues">📊 Painel de Filas (Admin)</a>
            <a href="/api/products">📦 API de Produtos</a>
            <a href="/api/stats">📈 Estatísticas Globais</a>
          </div>
        </body>
      </html>
    `);
  });

  return new Promise((resolve) => {
    server = app.listen(config.DASHBOARD_PORT, () => {
      logger.info(
        { port: config.DASHBOARD_PORT, paths: ['/admin/queues', '/api'] },
        '🚀 Dashboard & API rodando em http://localhost:%d',
        config.DASHBOARD_PORT
      );
      resolve();
    });
  });
}

/**
 * Fecha o servidor do dashboard graciosamente
 */
export async function closeDashboard(): Promise<void> {
  if (!server) return;

  return new Promise((resolve, reject) => {
    server?.close((err) => {
      if (err) {
        logger.error({ error: err.message }, 'Erro ao fechar servidor do dashboard');
        reject(err);
      } else {
        logger.info('✅ Servidor do dashboard fechado');
        resolve();
      }
    });
  });
}

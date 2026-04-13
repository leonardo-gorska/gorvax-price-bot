// ============================================
// Scraper Base — Browser, helpers, interface
// ============================================

import * as cheerio from 'cheerio';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';
import { randomUserAgent, getConfig } from '../config';
import type { Browser, Page } from 'puppeteer-core';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-core';

// Explicitly link puppeteer-extra to puppeteer-core
if (!(puppeteerExtra as any).puppeteer) {
  (puppeteerExtra as any).puppeteer = puppeteer; 
}
puppeteerExtra.use(StealthPlugin());

import { proxyManager } from '../utils/proxy';

// ─── Browser Management ────────────────────

let browserInstance: any | null = null;
let browserLaunchPromise: Promise<any> | null = null;
let pageCount = 0;
const MAX_PAGES_BEFORE_RECYCLE = 50;

// Pool de páginas para reuso
const pagePool: Page[] = [];
const MAX_POOL_SIZE = 5;

/** Inicia ou retorna a instância global do browser */
async function getBrowser(): Promise<any> {
  if (browserInstance) return browserInstance;

  // Prevents multiple simultaneous launches
  if (browserLaunchPromise) return browserLaunchPromise;

  browserLaunchPromise = (async () => {
    // Try to find Chrome/Chromium executable
    let execPath: string | undefined;
    
    // Explicit candidates for Windows
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.CHROME_PATH, // Allow override via env
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ].filter(Boolean) as string[];

    execPath = candidates.find(p => existsSync(p));
    
    if (!execPath) {
      try {
        execPath = puppeteer.executablePath();
      } catch (err) {
        logger.error('Não foi possível encontrar o executável do Chrome/Chromium automaticamente.');
      }
    }

    if (execPath) {
      logger.info({ execPath }, 'Usando executável do browser');
    } else {
      throw new Error('Chrome executable not found. Please install Chrome or set CHROME_PATH.');
    }

    const configOpts = getConfig(); // Use getConfig as defined in config.ts
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--no-first-run',
      '--no-zygote',
    ];

    const proxy = proxyManager.getNextProxy();
    if (proxy) {
      args.push(`--proxy-server=${proxy}`);
      logger.info({ proxy }, '🌐 Browser usando proxy rotacionado');
    }

    const browser = await puppeteerExtra.launch({
      headless: true,
      executablePath: execPath,
      args: [
        ...args,
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--force-color-profile=srgb',
        '--no-default-browser-check',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-strict-mixed-content-checking',
        '--ignore-certificate-errors',
        '--window-size=1920,1080',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      },
    });

    browser.on('disconnected', () => {
      logger.warn('⚠️ Instância do Puppeteer desconectada.');
      browserInstance = null;
    });

    browserInstance = browser;
    browserLaunchPromise = null;
    logger.info('🌐 Browser Puppeteer iniciado');
    return browser;
  })();

  return browserLaunchPromise;
}

/** Fecha o browser para liberar memória */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try {
      logger.info('♻️ Fechando instância do browser para reciclagem de RAM');
      await browserInstance.close();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ error: message }, 'Erro ao fechar browser');
    }
    browserInstance = null;
    browserLaunchPromise = null;
    pageCount = 0;
  }
}

/** Retorna uma página do pool ou cria uma nova */
async function getPageFromPool(): Promise<Page> {
  const browser = await getBrowser();
  if (pagePool.length > 0) {
    const page = pagePool.pop()!;
    // Verifica se a página ainda está aberta
    if (!page.isClosed()) {
      logger.debug('♻️ Reutilizando aba do pool');
      return page;
    }
  }
  
  const page = await browser.newPage() as Page;
  pageCount++;
  return page;
}

/** Devolve uma página para o pool ou fecha se o pool estiver cheio */
async function releasePageToPool(page: Page): Promise<void> {
  if (pagePool.length < MAX_POOL_SIZE && !page.isClosed()) {
    // Limpar estado básico (opcional, mas recomendado)
    try {
      await page.goto('about:blank').catch(() => {});
      pagePool.push(page);
    } catch (e) {
      await page.close().catch(() => {});
    }
  } else {
    await page.close().catch(() => {});
  }
}

/** Retorna uso de memória do processo em MB */
export function getMemoryUsage(): number {
  const consumed = process.memoryUsage().rss / 1024 / 1024;
  return Math.round(consumed * 100) / 100;
}

/** Recicla o browser se necessário (por page count ou RAM) */
export async function recycleBrowserIfNeeded(): Promise<void> {
  const ram = getMemoryUsage();
  if (pageCount >= MAX_PAGES_BEFORE_RECYCLE || ram > 300) {
    logger.info({ pageCount, ram }, '♻️ Reciclando browser (páginas ou RAM)');
    await closeBrowser();
    pageCount = 0;
  }
}

/** Watchdog: verifica se o browser ainda está responsivo */
export async function browserHealthCheck(): Promise<boolean> {
  if (!browserInstance) return true; // Sem browser ativo = ok, será criado quando necessário
  try {
    const page = await (browserInstance as Browser).newPage();
    await page.close();
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ error: message }, '💀 Browser não responsivo! Forçando restart...');
    browserInstance = null;
    browserLaunchPromise = null;
    return false;
  }
}

// ─── Cache HTML ────────────────────────────

interface CacheEntry {
  html: string;
  timestamp: number;
}
const htmlCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

/** Retorna HTML do cache se ainda válido */
function getCachedHtml(url: string): string | null {
  // Não faz cache de buscas, pois o resultado pode mudar e cruzar entre produtos
  const isSearch = url.toLowerCase().includes('busca') || 
                   url.toLowerCase().includes('search') || 
                   url.toLowerCase().includes('/s?');
  if (isSearch) return null;

  const entry = htmlCache.get(url);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS) {
    return entry.html;
  }
  return null;
}

// ─── HTML Fetching ─────────────────────────

import axios from 'axios';
import { performance } from 'perf_hooks';

/** Busca HTML: tenta fetch rápido primeiro, faz fallback pro Puppeteer se for bloqueado */
export async function fetchHtml(
  url: string,
  useBrowser = false,
  jsRequired = false,
  retries: number = 1,
  waitSelector?: string,
  cookies?: Array<{name: string, value: string, domain: string}>,
  timeout?: number,
  retryOnStrings?: string[]
): Promise<string | null> {
  const cached = getCachedHtml(url);
  if (cached) {
    logger.debug({ url }, '⚡ Usando HTML em cache');
    return cached;
  }

  const startTime = performance.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Tenta via Axios primeiro (se não exigir JS e não for Terabyte/ML)
    const isHighProtection = url.includes('terabyte') || url.includes('mercadolivre') || url.includes('pichau');
    if (!useBrowser && !jsRequired && !isHighProtection) {
      try {
        // 1. HTTP Rápido (Axios)
        logger.debug({ url, attempt: attempt + 1 }, 'Tentando fetch leve via Axios');
        const configOpts = getConfig();
        
        const axiosConfig: import('axios').AxiosRequestConfig = {
          headers: {
            'User-Agent': randomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
          },
          timeout: 5000,
          validateStatus: (status) => status < 400 || status === 403 || status === 404 || status === 503,
        };

        const proxy = proxyManager.getNextProxy();
        if (proxy) {
          try {
            const urlObj = new URL(proxy);
            axiosConfig.proxy = {
              protocol: urlObj.protocol.replace(':', ''),
              host: urlObj.hostname,
              port: parseInt(urlObj.port) || 80,
            };
            if (configOpts.PROXY_AUTH) {
              const [username, password] = configOpts.PROXY_AUTH.split(':');
              axiosConfig.proxy.auth = { username, password };
            }
          } catch (err) {
            logger.warn({ err, proxy }, '🌐 Proxy inválido para Axios config');
          }
        }

        const response = await axios.get(url, axiosConfig);

        const html = response.data as string;
        const isBlocked = 
          response.status === 403 || 
          response.status === 503 ||
          html.includes('Just a moment...') || 
          html.includes('Attention Required!') ||
          html.includes('enable JavaScript in your browser') ||
          html.includes('Cloudflare');

        if (!isBlocked && response.status === 200) {
          const duration = Math.round(performance.now() - startTime);
          logger.info({ url, durationMs: duration, store: scraperNameFromUrl(url), method: 'axios' }, '✅ Fetch concluído via Axios');
          htmlCache.set(url, { html, timestamp: Date.now() });
          return html;
        }
        
        logger.debug({ url, status: response.status }, 'Bloqueio detectado no Axios, iniciando Fallback Puppeteer');
      } catch (e) {
        logger.debug({ url }, 'Falha no Axios, caindo pro Fallback Puppeteer');
      }
    }
    let page: Page | undefined;
    try {
      const configOpts = getConfig();
      page = await getPageFromPool();

      const isML = url.includes('mercadolivre');
      const isShopee = url.includes('shopee.com.br');
      const isAmazon = url.includes('amazon.com.br');
      const waitUntil = (jsRequired || isML || isShopee || isAmazon) ? ((isML || isShopee || isAmazon) ? 'networkidle2' : 'networkidle2') : 'domcontentloaded';

      if (isAmazon) {
        // Pequeno delay aleatório para Amazon para quebrar padrões
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
      }

      if (configOpts.PROXY_AUTH) {
        const [username, password] = configOpts.PROXY_AUTH.split(':');
        await page.authenticate({ username, password });
      }

      if (cookies && cookies.length > 0) {
        logger.debug({ count: cookies.length }, 'Injecting custom cookies into Puppeteer page');
        await page.setCookie(...cookies);
      }

      const ua = randomUserAgent();
      await page.setUserAgent(ua);

      // Stealth: hide webdriver
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });

      // Stealth: Client Hints override (dinâmico baseado no UA)
      try {
        const isWindows = ua.includes('Windows');
        const isMac = ua.includes('Macintosh');
        const isLinux = ua.includes('Linux');
        const platform = isWindows ? 'Windows' : (isMac ? 'macOS' : (isLinux ? 'Linux' : 'Windows'));
        const platformCH = isWindows ? 'Win32' : (isMac ? 'MacIntel' : (isLinux ? 'Linux' : 'Win32'));

        const brands = [
          {brand: 'Google Chrome', version: '131'},
          {brand: 'Chromium', version: '131'},
          {brand: 'Not_A Brand', version: '24'}
        ];
        
        // If UA is Chrome 130, adjust brands
        if (ua.includes('Chrome/130')) {
          brands[0].version = '130';
          brands[1].version = '130';
        }

        const client = await (page as any).target().createCDPSession();
        await client.send('Network.setUserAgentOverride', {
          userAgent: ua,
          acceptLanguage: 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          platform: platformCH,
          userAgentMetadata: {
            brands,
            fullVersion: ua.includes('131') ? '131.0.6778.140' : '130.0.6468.2',
            platform: platform,
            platformVersion: '10.0.0',
            architecture: 'x86',
            model: '',
            mobile: false
          }
        });
      } catch (err) {
        logger.debug('Falha ao definir Client Hints');
      }

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': isAmazon ? 'same-origin' : 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        ...(isAmazon ? {
          'Referer': 'https://www.google.com/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        } : {})
      });

      // Priming: se for Shopee/Terabyte/ML e novo browser, vai pra home primeiro
      const isTerabyte = url.includes('terabyte');
      const isMLPriming = url.includes('mercadolivre');
      if ((isShopee || isTerabyte || isMLPriming) && pageCount === 0) {
        logger.debug(`Priming ${isShopee ? 'Shopee' : (isMLPriming ? 'Mercado Livre' : 'Terabyte')} home page...`);
        const homeUrl = isShopee ? 'https://shopee.com.br/' : (isMLPriming ? 'https://www.mercadolivre.com.br/' : 'https://www.terabyteshop.com.br/');
        
        // Shopee specific headers for priming
        if (isShopee) {
          await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
          });
        }
        
        await page.goto(homeUrl, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
        
        // Simular movimento humano
        await page.mouse.move(100, 100);
        await page.mouse.move(200, 300, { steps: 5 });
        
        // Clicar em "Aceitar todos os cookies" se aparecer (Shopee)
        if (isShopee) {
          try {
            const cookieBtn = await page.waitForSelector('button#onetrust-accept-btn-handler, .shopee-cookie-policy-banner__button, button.shopee-button-outline', { timeout: 5000 }).catch(() => null);
            if (cookieBtn) {
               await cookieBtn.click();
               logger.debug('Shopee cookie consent accepted');
               await sleep(2000);
            }
            // Add a wait to allow Shopee's tracking and session scripts to initialize
            await page.waitForFunction('typeof window !== "undefined" && "shopee" in window', { timeout: 5000 }).catch(() => {});
            logger.debug('Shopee base session initialized');
          } catch (e) {
            // ignore
          }
        }

        await page.evaluate('window.scrollBy(0, 500)');
        await new Promise(r => setTimeout(r, 2000));
        await page.evaluate('window.scrollBy(0, -200)');
        await new Promise(r => setTimeout(r, 1000));
      }

      await page.goto(url, { 
        waitUntil, 
        timeout: timeout || 60000 
      }).catch(err => {
        logger.warn({ url, error: err.message }, 'Navigation timeout/error, continuing anyway to attempt extraction');
      });

      // Se for ML, dar um tempo extra para JS carregar se o waitUntil for domcontentloaded
      if (isML) {
        await new Promise(r => setTimeout(r, 5000));
      }

      // Espera conteúdo JS renderizar
      if (waitSelector) {
        // Espera o seletor específico aparecer (produto renderizado)
        try {
          await page.waitForSelector(waitSelector, { timeout: 30000 });
          // Delay extra proporcional à lentidão da Terabyte (reduzido de 12s para 4s + smart check)
          await new Promise(r => setTimeout(r, 4000));
        } catch (err) {
          logger.warn({ url, waitSelector }, 'waitForSelector expirou. Capturando screenshot para debug...');
          try {
             const path = getDebugPath(`debug_timeout_${Date.now()}.png`);
             await page.screenshot({ path, fullPage: false });
             logger.info({ screenshot: path }, 'Screenshot de debug salvo (timeout seletor)');
          } catch (screenshotErr) {
             logger.error({ screenshotErr }, 'Falha ao salvar screenshot');
          }
        }
      } else {
        // Sem seletor — espera baseline para JS executar
        await new Promise(r => setTimeout(r, 2000));
      }


      const html = await page.content();

      // Check for block strings if provided
      if (retryOnStrings && retryOnStrings.length > 0) {
        const foundBlock = retryOnStrings.find(s => html.includes(s));
        if (foundBlock) {
          logger.warn({ url, foundBlock }, '🚩 Bloqueio detectado via string no Puppeteer, forçando retry...');
          throw new Error(`Blocked by content: ${foundBlock}`);
        }
      }

      await releasePageToPool(page);

      const duration = Math.round(performance.now() - startTime);
      logger.info({ url, durationMs: duration, store: scraperNameFromUrl(url), method: 'puppeteer' }, '✅ Fetch concluído via Puppeteer');

      // Não faz cache de buscas
      const isSearch = url.toLowerCase().includes('busca') || 
                       url.toLowerCase().includes('search') || 
                       url.toLowerCase().includes('/s?');
      if (!isSearch) {
        htmlCache.set(url, { html, timestamp: Date.now() });
      }
      
      return html;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(
        { url, attempt: attempt + 1, maxRetries: retries, error: message },
        'Erro ao buscar página no Puppeteer'
      );

      // Captura screenshot de erro ANTES de fechar a página
      if (page) {
        try {
          const timestamp = Date.now();
          const errorPath = getDebugPath(`error_${timestamp}.png`);
          await page.screenshot({ path: errorPath, fullPage: false });
          logger.info({ screenshot: errorPath }, 'Screenshot de erro salvo');
          
          const htmlPath = getDebugPath(`error_${timestamp}.html`);
          const htmlContent = await page.content();
          writeFileSync(htmlPath, htmlContent);
          logger.info({ html: htmlPath }, 'HTML de erro salvo');
          
          await page.close().catch(() => {});
        } catch (sErr) {
          logger.error({ error: sErr }, 'Falha ao capturar diagnóstico de erro');
          await page.close().catch(() => {});
        }
      }

      if (attempt < retries) {
        // Exponential backoff
        const backoffMs = 2000 * Math.pow(2, attempt);
        await sleep(backoffMs);
      }
    }
  }
  return null;
}

// ─── Parsing Helpers ───────────────────────

/** Parse HTML com Cheerio */
export function parseHtml(html: string): cheerio.CheerioAPI {
  return cheerio.load(html);
}

/** Extrai preço de uma string brasileira: "R$ 1.234,56" -> 1234.56 */
export function parsePrice(text: string | undefined | null): number | null {
  if (!text) return null;
  // Mantém números, vírgula, ponto e sinal de menos
  const cleaned = text.replace(/[^\d.,-]/g, '').trim();
  if (!cleaned) return null;

  // Formato BR: 1.234,56
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const price = parseFloat(normalized);
  return isNaN(price) || price <= 0 ? null : price;
}

/** Tenta encontrar um cupom de desconto no HTML da página */
export function extractCoupon(html: string): string | null {
  // Remove scripts and styles
  let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  // Remove HTML tags
  const text = cleanHtml.replace(/<[^>]*>?/gm, ' ');
  const match = text.match(/(?:cupom|codigo|código)[\s:-]+([A-Z0-9]{4,15})\b/i);

  if (match?.[1]) {
    const coupon = match[1].toUpperCase();
    const invalid = ['APLICADO', 'INVALIDO', 'VALIDO', 'DESCONTO', 'PROMOCIONAL', 'AQUI', 'AGORA'];
    if (!invalid.includes(coupon)) return coupon;
  }
  return null;
}

// ─── Smart Extraction Helpers ──────────────

/** Extrai o primeiro preço no formato brasileiro "R$ X.XXX,XX" de um texto */
export function extractFirstPrice(text: string): number | null {
  if (!text) return null;
  // Formato "R$ 1.234,56"
  const match = text.match(/R\$\s*([\d.]+,\d{2})/);
  if (match) return parsePrice(match[1]);
  // Fallback: qualquer valor com vírgula decimal
  const fallback = text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
  if (fallback) return parsePrice(fallback[1]);
  return null;
}

/** Extrai todos os preços BR de um texto, ordenados do menor ao maior */
export function extractAllPrices(text: string): number[] {
  const matches = [...text.matchAll(/R\$\s*([\d.]+,\d{2})/g)];
  const prices: number[] = [];
  for (const match of matches) {
    const p = parsePrice(match[1]);
    if (p !== null) prices.push(p);
  }
  return prices.sort((a, b) => a - b);
}
/** Retorna o caminho para um arquivo de debug em data/logs/debug/ */
export function getDebugPath(filename: string): string {
  const debugDir = join(process.cwd(), 'data', 'logs', 'debug');
  if (!existsSync(debugDir)) {
    mkdirSync(debugDir, { recursive: true });
  }
  return join(debugDir, filename);
}

// ─── Utilities ─────────────────────────────

/** Identifica o nome da loja a partir da URL (simplificado para logs) */
function scraperNameFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('kabum')) return 'kabum';
  if (lower.includes('pichau')) return 'pichau';
  if (lower.includes('terabyte')) return 'terabyte';
  if (lower.includes('amazon')) return 'amazon';
  if (lower.includes('mercadolivre')) return 'mercadolivre';
  if (lower.includes('aliexpress')) return 'aliexpress';
  if (lower.includes('shopee')) return 'shopee';
  if (lower.includes('gkinfostore')) return 'gkinfostore';
  return 'unknown';
}

/** Sleep helper */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Interface que todo scraper deve implementar */
export interface Scraper {
  name: string;
  canHandle(url: string): boolean;
  scrape(url: string, expectedName?: string): Promise<ScrapeResult | null>;
}

// ============================================
// Seed Data — Produtos Iniciais (Setup Desktop AM5)
// ============================================
// Baseado na pesquisa de upgrade: Cenário C (PC novo AM5)
// RAM: 2x16GB DDR5 (32GB total) conforme pedido
// Produtos expandidos com alternativas para cada categoria

import type { SeedProduct } from '../types';

export const SEED_PRODUCTS: SeedProduct[] = [

  // ═══════════════════════════════════════════
  // 🧠 CPUs — AMD AM5
  // ═══════════════════════════════════════════

  // --- Ryzen 5 7500F (principal) ---
  { url: 'https://www.kabum.com.br/produto/390987/processador-amd-ryzen-5-7600x-5-3ghz-cache-38mb-am5-radeon-graphics-100-100000593wof', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 5 7500F', target_price: 800 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+5+7500f', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 5 7500F', target_price: 800 },
  { url: 'https://www.terabyteshop.com.br/busca?str=ryzen+5+7500f', store: 'terabyte', category: 'cpu', name: 'AMD Ryzen 5 7500F', target_price: 800 },

  // --- Ryzen 5 7600 (alternativa, com iGPU) ---
  { url: 'https://www.kabum.com.br/produto/405791/processador-amd-ryzen-5-7600-5-1ghz-max-turbo-cache-38mb-am5-6-nucleos-video-integrado-100-100001015box', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 5 7600', target_price: 950 },
  { url: 'https://www.pichau.com.br/processador-amd-ryzen-5-7600-6-core-12-threads-3-8ghz-5-1ghzturbo-cache-38mb-am5-100-100001015box', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 5 7600', target_price: 950 },
  { url: 'https://www.terabyteshop.com.br/produto/23458/processador-amd-ryzen-5-7600-38ghz-51ghz-turbo-6-cores-12-threads-am5-com-cooler-wraith-stealth-100-100001015box', store: 'terabyte', category: 'cpu', name: 'AMD Ryzen 5 7600', target_price: 950 },

  // --- Ryzen 5 7600X (alternativa premium) ---
  { url: 'https://www.kabum.com.br/produto/390987/processador-amd-ryzen-5-7600x-5-3ghz-cache-38mb-am5-radeon-graphics-100-100000593wof', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 5 7600X', target_price: 1050 },
  { url: 'https://www.pichau.com.br/processador-amd-ryzen-5-7600x-6-core-12-threads-4-7ghz-5-3ghzturbo-cache-38mb-am5-100-100000593wof', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 5 7600X', target_price: 1050 },

  // --- Ryzen 7 7700 (upgrade futuro) ---
  { url: 'https://www.kabum.com.br/produto/405801/processador-amd-ryzen-7-7700-5-3ghz-max-turbo-cache-40mb-am5-8-nucleos-video-integrado-100-100000592box', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 7 7700', target_price: 1400 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+7+7700', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 7 7700', target_price: 1400 },

  // --- Ryzen 7 7800X3D (top gamer) ---
  { url: 'https://www.kabum.com.br/produto/426262/processador-amd-ryzen-7-7800x3d-5-0ghz-max-turbo-cache-104mb-am5-8-nucleos-video-integrado-100-100000910wof', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 7 7800X3D', target_price: 2200 },
  { url: 'https://www.pichau.com.br/processador-amd-ryzen-7-7800x3d-8-core-16-threads-4-2ghz-5-0ghzturbo-cache-104mb-am5-100-100000910wof-br', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 7 7800X3D', target_price: 2200 },
  { url: 'https://www.terabyteshop.com.br/produto/24769/processador-amd-ryzen-7-7800x3d-42ghz-50ghz-turbo-8-cores-16-threads-am5-sem-cooler-100-100000910wof', store: 'terabyte', category: 'cpu', name: 'AMD Ryzen 7 7800X3D', target_price: 2200 },

  // ═══════════════════════════════════════════
  // 🔌 Placas-Mãe — AM5 B650
  // ═══════════════════════════════════════════

  // --- Gigabyte B650M DS3H ---
  { url: 'https://www.kabum.com.br/produto/392052/placa-mae-gigabyte-b650m-ds3h-rev-1-0-rgb-amd-micro-atx-ddr5-am5-preto', store: 'kabum', category: 'motherboard', name: 'Gigabyte B650M DS3H', target_price: 700 },
  { url: 'https://www.pichau.com.br/placa-mae-gigabyte-b650m-ds3h-ddr5-socket-am5-m-atx-chipset-amd-b650-b650m-ds3h', store: 'pichau', category: 'motherboard', name: 'Gigabyte B650M DS3H', target_price: 700 },
  { url: 'https://www.terabyteshop.com.br/produto/23473/placa-mae-gigabyte-b650m-ds3h-chipset-b650-amd-am5-matx-ddr5', store: 'terabyte', category: 'motherboard', name: 'Gigabyte B650M DS3H', target_price: 700 },

  // --- MSI PRO B650M-A WiFi ---
  { url: 'https://www.kabum.com.br/produto/392053/placa-mae-msi-pro-b650m-a-wifi-amd-am5-matx-ddr5-wi-fi-6e-bluetooth-5-2-hdmi-displayport', store: 'kabum', category: 'motherboard', name: 'MSI PRO B650M-A WiFi', target_price: 850 },
  { url: 'https://www.pichau.com.br/placa-mae-msi-pro-b650m-a-wifi-ddr5-socket-am5-m-atx-chipset-amd-b650-pro-b650m-a-wifi', store: 'pichau', category: 'motherboard', name: 'MSI PRO B650M-A WiFi', target_price: 850 },

  // --- ASUS PRIME B650M-A ---
  { url: 'https://www.kabum.com.br/busca/asus-prime-b650m-a', store: 'kabum', category: 'motherboard', name: 'ASUS PRIME B650M-A', target_price: 780 },
  { url: 'https://www.pichau.com.br/search?q=asus+prime+b650m-a', store: 'pichau', category: 'motherboard', name: 'ASUS PRIME B650M-A', target_price: 780 },
  { url: 'https://www.terabyteshop.com.br/busca?str=asus+prime+b650m-a', store: 'terabyte', category: 'motherboard', name: 'ASUS PRIME B650M-A', target_price: 780 },

  // --- ASRock B650M-HDV/M.2 (budget) ---
  { url: 'https://www.kabum.com.br/busca/b650m-hdv', store: 'kabum', category: 'motherboard', name: 'ASRock B650M-HDV/M.2', target_price: 650 },
  { url: 'https://www.pichau.com.br/search?q=asrock+b650m+hdv', store: 'pichau', category: 'motherboard', name: 'ASRock B650M-HDV/M.2', target_price: 650 },

  // --- Gigabyte B650 AORUS Elite AX (premium) ---
  { url: 'https://www.kabum.com.br/busca/b650-aorus-elite', store: 'kabum', category: 'motherboard', name: 'Gigabyte B650 AORUS Elite AX', target_price: 1100 },
  { url: 'https://www.pichau.com.br/search?q=b650+aorus+elite', store: 'pichau', category: 'motherboard', name: 'Gigabyte B650 AORUS Elite AX', target_price: 1100 },

  // ═══════════════════════════════════════════
  // 💾 RAM — DDR5 2x16GB (32GB total)
  // ═══════════════════════════════════════════

  // --- Kingston Fury Beast DDR5 32GB (2x16GB) 5600MHz ---
  { url: 'https://www.kabum.com.br/busca/kingston-fury-beast-ddr5-32gb-5600', store: 'kabum', category: 'ram2x16', name: 'Kingston Fury Beast DDR5 32GB (2x16) 5600MHz', target_price: 700 },
  { url: 'https://www.pichau.com.br/search?q=kingston+fury+beast+ddr5+32gb+5600', store: 'pichau', category: 'ram2x16', name: 'Kingston Fury Beast DDR5 32GB (2x16) 5600MHz', target_price: 700 },
  { url: 'https://www.terabyteshop.com.br/busca?str=fury+beast+ddr5+32gb+5600', store: 'terabyte', category: 'ram2x16', name: 'Kingston Fury Beast DDR5 32GB (2x16) 5600MHz', target_price: 700 },

  // --- Corsair Vengeance DDR5 32GB (2x16GB) 5600MHz ---
  { url: 'https://www.kabum.com.br/busca/corsair-vengeance-ddr5-32gb-5600', store: 'kabum', category: 'ram2x16', name: 'Corsair Vengeance DDR5 32GB (2x16) 5600MHz', target_price: 750 },
  { url: 'https://www.pichau.com.br/search?q=corsair+vengeance+ddr5+32gb+5600', store: 'pichau', category: 'ram2x16', name: 'Corsair Vengeance DDR5 32GB (2x16) 5600MHz', target_price: 750 },

  // --- G.Skill Flare X5 DDR5 32GB (2x16GB) 6000MHz ---
  { url: 'https://www.kabum.com.br/busca/gskill-flare-x5-ddr5-32gb', store: 'kabum', category: 'ram2x16', name: 'G.Skill Flare X5 DDR5 32GB (2x16) 6000MHz', target_price: 850 },
  { url: 'https://www.pichau.com.br/search?q=gskill+flare+x5+ddr5+32gb', store: 'pichau', category: 'ram2x16', name: 'G.Skill Flare X5 DDR5 32GB (2x16) 6000MHz', target_price: 850 },

  // --- XPG Lancer DDR5 32GB (2x16GB) 5600MHz (budget) ---
  { url: 'https://www.kabum.com.br/busca/xpg-lancer-ddr5-32gb-5600', store: 'kabum', category: 'ram2x16', name: 'XPG Lancer DDR5 32GB (2x16) 5600MHz', target_price: 650 },
  { url: 'https://www.pichau.com.br/search?q=xpg+lancer+ddr5+32gb+5600', store: 'pichau', category: 'ram2x16', name: 'XPG Lancer DDR5 32GB (2x16) 5600MHz', target_price: 650 },
  { url: 'https://www.terabyteshop.com.br/busca?str=xpg+lancer+ddr5+32gb+5600', store: 'terabyte', category: 'ram2x16', name: 'XPG Lancer DDR5 32GB (2x16) 5600MHz', target_price: 650 },

  // ═══════════════════════════════════════════
  // 🎮 GPUs — Placas de Vídeo
  // ═══════════════════════════════════════════

  // --- RX 7600 8GB (principal) ---
  { url: 'https://www.kabum.com.br/produto/475647/placa-de-video-rx-7600-gaming-oc-8g-amd-radeon-gigabyte-8gb-gddr6-128bits-rgb-gv-r76gaming-oc-8gd', store: 'kabum', category: 'gpu', name: 'AMD Radeon RX 7600 8GB', target_price: 1300 },
  { url: 'https://www.pichau.com.br/placa-de-video-gigabyte-radeon-rx-7600-gaming-oc-8gb-gddr6-128-bit-gv-r76gaming-oc-8gd', store: 'pichau', category: 'gpu', name: 'AMD Radeon RX 7600 8GB', target_price: 1300 },
  { url: 'https://www.terabyteshop.com.br/produto/25487/placa-de-video-gigabyte-amd-radeon-rx-7600-gaming-oc-8gb-gddr6-fsr-ray-tracing-gv-r76gaming-oc-8gd', store: 'terabyte', category: 'gpu', name: 'AMD Radeon RX 7600 8GB', target_price: 1300 },

  // --- RX 7600 XT 16GB (upgrade) ---
  { url: 'https://www.kabum.com.br/busca/rx-7600-xt', store: 'kabum', category: 'gpu', name: 'AMD Radeon RX 7600 XT 16GB', target_price: 1800 },
  { url: 'https://www.pichau.com.br/search?q=rx+7600+xt', store: 'pichau', category: 'gpu', name: 'AMD Radeon RX 7600 XT 16GB', target_price: 1800 },
  { url: 'https://www.terabyteshop.com.br/busca?str=rx+7600+xt', store: 'terabyte', category: 'gpu', name: 'AMD Radeon RX 7600 XT 16GB', target_price: 1800 },

  // --- RTX 4060 8GB (alternativa NVIDIA) ---
  { url: 'https://www.kabum.com.br/produto/496012/placa-de-video-rtx-4060-1-click-oc-1x-galax-nvidia-geforce-8gb-gddr6-dlss-ray-trancing-g-sync', store: 'kabum', category: 'gpu', name: 'NVIDIA GeForce RTX 4060 8GB', target_price: 1700 },
  { url: 'https://www.pichau.com.br/placa-de-video-asus-geforce-rtx-4060-dual-oc-edition-8gb-gddr6-128-bit-dual-rtx4060-o8g-evo', store: 'pichau', category: 'gpu', name: 'NVIDIA GeForce RTX 4060 8GB', target_price: 1700 },
  { url: 'https://www.terabyteshop.com.br/produto/25235/placa-de-video-gigabyte-nvidia-geforce-rtx-4060-windforce-oc-8gbgddr6-dlss-ray-tracing-gv-n4060wf2oc-8gd', store: 'terabyte', category: 'gpu', name: 'NVIDIA GeForce RTX 4060 8GB', target_price: 1700 },

  // --- RTX 4060 Ti 8GB (premium) ---
  { url: 'https://www.kabum.com.br/busca/rtx-4060-ti', store: 'kabum', category: 'gpu', name: 'NVIDIA GeForce RTX 4060 Ti 8GB', target_price: 2300 },
  { url: 'https://www.pichau.com.br/search?q=rtx+4060+ti', store: 'pichau', category: 'gpu', name: 'NVIDIA GeForce RTX 4060 Ti 8GB', target_price: 2300 },

  // --- RX 7700 XT 12GB (premium AMD) ---
  { url: 'https://www.kabum.com.br/produto/525889/placa-de-video-gigabyte-rx-7700-xt-gaming-oc-12g-amd-radeon-12gb-gddr6-192bits-rgb-gv-r77xtgaming-oc-12gd', store: 'kabum', category: 'gpu', name: 'AMD Radeon RX 7700 XT 12GB', target_price: 2200 },
  { url: 'https://www.pichau.com.br/search?q=rx+7700+xt', store: 'pichau', category: 'gpu', name: 'AMD Radeon RX 7700 XT 12GB', target_price: 2200 },
  { url: 'https://www.terabyteshop.com.br/busca?str=rx+7700+xt', store: 'terabyte', category: 'gpu', name: 'AMD Radeon RX 7700 XT 12GB', target_price: 2200 },

  // --- Arc A770 16GB (budget alternativa Intel) ---
  { url: 'https://www.kabum.com.br/busca/arc-a770-16gb', store: 'kabum', category: 'gpu', name: 'Intel Arc A770 16GB', target_price: 1200 },
  { url: 'https://www.pichau.com.br/search?q=intel+arc+a770', store: 'pichau', category: 'gpu', name: 'Intel Arc A770 16GB', target_price: 1200 },

  // ═══════════════════════════════════════════
  // 🔋 Fontes (PSU) — 600W+
  // ═══════════════════════════════════════════

  // --- Corsair CV650 650W 80+ Bronze ---
  { url: 'https://www.kabum.com.br/busca/corsair-cv650', store: 'kabum', category: 'psu', name: 'Corsair CV650 650W 80+ Bronze', target_price: 280 },
  { url: 'https://www.pichau.com.br/search?q=corsair+cv650', store: 'pichau', category: 'psu', name: 'Corsair CV650 650W 80+ Bronze', target_price: 280 },
  { url: 'https://www.terabyteshop.com.br/busca?str=corsair+cv650', store: 'terabyte', category: 'psu', name: 'Corsair CV650 650W 80+ Bronze', target_price: 280 },

  // --- EVGA 600W 80+ White ---
  { url: 'https://www.kabum.com.br/busca/evga-600w', store: 'kabum', category: 'psu', name: 'EVGA 600W 80+ White', target_price: 230 },
  { url: 'https://www.pichau.com.br/search?q=evga+600w', store: 'pichau', category: 'psu', name: 'EVGA 600W 80+ White', target_price: 230 },

  // --- Cooler Master MWE 650W 80+ Bronze V2 ---
  { url: 'https://www.kabum.com.br/busca/cooler-master-mwe-650', store: 'kabum', category: 'psu', name: 'Cooler Master MWE 650W 80+ Bronze V2', target_price: 310 },
  { url: 'https://www.pichau.com.br/search?q=cooler+master+mwe+650', store: 'pichau', category: 'psu', name: 'Cooler Master MWE 650W 80+ Bronze V2', target_price: 310 },
  { url: 'https://www.terabyteshop.com.br/busca?str=cooler+master+mwe+650', store: 'terabyte', category: 'psu', name: 'Cooler Master MWE 650W 80+ Bronze V2', target_price: 310 },

  // --- XPG Core Reactor 650W 80+ Gold (premium) ---
  { url: 'https://www.kabum.com.br/busca/xpg-core-reactor-650', store: 'kabum', category: 'psu', name: 'XPG Core Reactor 650W 80+ Gold Full Modular', target_price: 400 },
  { url: 'https://www.pichau.com.br/search?q=xpg+core+reactor+650', store: 'pichau', category: 'psu', name: 'XPG Core Reactor 650W 80+ Gold Full Modular', target_price: 400 },

  // --- DeepCool PF600 600W 80+ ---
  { url: 'https://www.kabum.com.br/busca/deepcool-pf600', store: 'kabum', category: 'psu', name: 'DeepCool PF600 600W 80+', target_price: 220 },
  { url: 'https://www.pichau.com.br/search?q=deepcool+pf600', store: 'pichau', category: 'psu', name: 'DeepCool PF600 600W 80+', target_price: 220 },

  // --- Gamemax GP-650 650W 80+ Bronze ---
  { url: 'https://www.kabum.com.br/busca/gamemax-gp650', store: 'kabum', category: 'psu', name: 'Gamemax GP-650 650W 80+ Bronze', target_price: 250 },
  { url: 'https://www.terabyteshop.com.br/busca?str=gamemax+gp650', store: 'terabyte', category: 'psu', name: 'Gamemax GP-650 650W 80+ Bronze', target_price: 250 },

  // ═══════════════════════════════════════════
  // 💿 SSDs SATA — 1TB+
  // ═══════════════════════════════════════════

  // --- Kingston A400 960GB/1TB ---
  { url: 'https://www.kabum.com.br/busca/kingston-a400-960gb', store: 'kabum', category: 'ssd', name: 'Kingston A400 960GB SATA', target_price: 350 },
  { url: 'https://www.pichau.com.br/search?q=kingston+a400+960gb', store: 'pichau', category: 'ssd', name: 'Kingston A400 960GB SATA', target_price: 350 },

  // --- WD Green 1TB SATA ---
  { url: 'https://www.kabum.com.br/busca/wd-green-1tb-sata', store: 'kabum', category: 'ssd', name: 'WD Green 1TB SATA', target_price: 350 },
  { url: 'https://www.pichau.com.br/search?q=wd+green+1tb+ssd', store: 'pichau', category: 'ssd', name: 'WD Green 1TB SATA', target_price: 350 },

  // --- Crucial BX500 1TB SATA ---
  { url: 'https://www.kabum.com.br/busca/crucial-bx500-1tb', store: 'kabum', category: 'ssd', name: 'Crucial BX500 1TB SATA', target_price: 350 },
  { url: 'https://www.pichau.com.br/search?q=crucial+bx500+1tb', store: 'pichau', category: 'ssd', name: 'Crucial BX500 1TB SATA', target_price: 350 },
  { url: 'https://www.terabyteshop.com.br/busca?str=crucial+bx500+1tb', store: 'terabyte', category: 'ssd', name: 'Crucial BX500 1TB SATA', target_price: 350 },

  // --- Samsung 870 EVO 1TB (premium SATA) ---
  { url: 'https://www.kabum.com.br/busca/samsung-870-evo-1tb', store: 'kabum', category: 'ssd', name: 'Samsung 870 EVO 1TB SATA', target_price: 500 },
  { url: 'https://www.pichau.com.br/search?q=samsung+870+evo+1tb', store: 'pichau', category: 'ssd', name: 'Samsung 870 EVO 1TB SATA', target_price: 500 },

  // ═══════════════════════════════════════════
  // ⚡ NVMe M.2 — 1TB+
  // ═══════════════════════════════════════════

  // --- Kingston NV2 1TB NVMe PCIe 4.0 ---
  { url: 'https://www.kabum.com.br/busca/kingston-nv2-1tb', store: 'kabum', category: 'nvme', name: 'Kingston NV2 1TB NVMe PCIe 4.0', target_price: 350 },
  { url: 'https://www.pichau.com.br/search?q=kingston+nv2+1tb', store: 'pichau', category: 'nvme', name: 'Kingston NV2 1TB NVMe PCIe 4.0', target_price: 350 },
  { url: 'https://www.terabyteshop.com.br/busca?str=kingston+nv2+1tb', store: 'terabyte', category: 'nvme', name: 'Kingston NV2 1TB NVMe PCIe 4.0', target_price: 350 },

  // --- WD Blue SN580 1TB NVMe PCIe 4.0 ---
  { url: 'https://www.kabum.com.br/busca/wd-blue-sn580-1tb', store: 'kabum', category: 'nvme', name: 'WD Blue SN580 1TB NVMe PCIe 4.0', target_price: 400 },
  { url: 'https://www.pichau.com.br/search?q=wd+blue+sn580+1tb', store: 'pichau', category: 'nvme', name: 'WD Blue SN580 1TB NVMe PCIe 4.0', target_price: 400 },

  // --- Crucial P3 1TB NVMe PCIe 3.0 (budget) ---
  { url: 'https://www.kabum.com.br/busca/crucial-p3-1tb', store: 'kabum', category: 'nvme', name: 'Crucial P3 1TB NVMe PCIe 3.0', target_price: 320 },
  { url: 'https://www.pichau.com.br/search?q=crucial+p3+1tb', store: 'pichau', category: 'nvme', name: 'Crucial P3 1TB NVMe PCIe 3.0', target_price: 320 },
  { url: 'https://www.terabyteshop.com.br/busca?str=crucial+p3+1tb', store: 'terabyte', category: 'nvme', name: 'Crucial P3 1TB NVMe PCIe 3.0', target_price: 320 },

  // --- Samsung 980 PRO 1TB NVMe PCIe 4.0 (premium) ---
  { url: 'https://www.kabum.com.br/busca/samsung-980-pro-1tb', store: 'kabum', category: 'nvme', name: 'Samsung 980 PRO 1TB NVMe PCIe 4.0', target_price: 550 },
  { url: 'https://www.pichau.com.br/search?q=samsung+980+pro+1tb', store: 'pichau', category: 'nvme', name: 'Samsung 980 PRO 1TB NVMe PCIe 4.0', target_price: 550 },

  // --- Kingston NV2 2TB NVMe PCIe 4.0 ---
  { url: 'https://www.kabum.com.br/busca/kingston-nv2-2tb', store: 'kabum', category: 'nvme', name: 'Kingston NV2 2TB NVMe PCIe 4.0', target_price: 650 },
  { url: 'https://www.pichau.com.br/search?q=kingston+nv2+2tb', store: 'pichau', category: 'nvme', name: 'Kingston NV2 2TB NVMe PCIe 4.0', target_price: 650 },
  { url: 'https://www.terabyteshop.com.br/busca?str=kingston+nv2+2tb', store: 'terabyte', category: 'nvme', name: 'Kingston NV2 2TB NVMe PCIe 4.0', target_price: 650 },

  // --- Crucial P3 Plus 2TB NVMe PCIe 4.0 ---
  { url: 'https://www.kabum.com.br/busca/crucial-p3-plus-2tb', store: 'kabum', category: 'nvme', name: 'Crucial P3 Plus 2TB NVMe PCIe 4.0', target_price: 700 },
  { url: 'https://www.pichau.com.br/search?q=crucial+p3+plus+2tb', store: 'pichau', category: 'nvme', name: 'Crucial P3 Plus 2TB NVMe PCIe 4.0', target_price: 700 },

  // ═══════════════════════════════════════════
  // ❄️ Coolers — CPU (AM5)
  // ═══════════════════════════════════════════

  // --- DeepCool GAMMAXX 400 V2 ---
  { url: 'https://www.kabum.com.br/busca/deepcool-gammaxx-400-v2', store: 'kabum', category: 'cooler', name: 'DeepCool GAMMAXX 400 V2', target_price: 100 },
  { url: 'https://www.pichau.com.br/search?q=deepcool+gammaxx+400', store: 'pichau', category: 'cooler', name: 'DeepCool GAMMAXX 400 V2', target_price: 100 },

  // --- Cooler Master Hyper 212 ---
  { url: 'https://www.kabum.com.br/busca/hyper-212', store: 'kabum', category: 'cooler', name: 'Cooler Master Hyper 212', target_price: 180 },
  { url: 'https://www.pichau.com.br/search?q=hyper+212', store: 'pichau', category: 'cooler', name: 'Cooler Master Hyper 212', target_price: 180 },

  // --- Thermalright Assassin X 120 Refined SE ---
  { url: 'https://www.kabum.com.br/busca/thermalright-assassin-x-120', store: 'kabum', category: 'cooler', name: 'Thermalright Assassin X 120 Refined SE', target_price: 80 },
  { url: 'https://www.pichau.com.br/search?q=thermalright+assassin+x+120', store: 'pichau', category: 'cooler', name: 'Thermalright Assassin X 120 Refined SE', target_price: 80 },

  // ═══════════════════════════════════════════
  // 🖥️ Gabinetes — Mid-Tower
  // ═══════════════════════════════════════════

  // --- Montech X3 Glass ---
  { url: 'https://www.kabum.com.br/busca/montech-x3-glass', store: 'kabum', category: 'case', name: 'Montech X3 Glass Mid-Tower', target_price: 250 },
  { url: 'https://www.pichau.com.br/search?q=montech+x3+glass', store: 'pichau', category: 'case', name: 'Montech X3 Glass Mid-Tower', target_price: 250 },

  // --- Redragon Wheel Jack ---
  { url: 'https://www.kabum.com.br/busca/redragon-wheel-jack', store: 'kabum', category: 'case', name: 'Redragon Wheel Jack Mid-Tower', target_price: 200 },
  { url: 'https://www.pichau.com.br/search?q=redragon+wheel+jack', store: 'pichau', category: 'case', name: 'Redragon Wheel Jack Mid-Tower', target_price: 200 },

  // --- Cooler Master Q300L V2 ---
  { url: 'https://www.kabum.com.br/busca/cooler-master-q300l', store: 'kabum', category: 'case', name: 'Cooler Master Q300L V2', target_price: 280 },

  // --- NZXT H5 Flow ---
  { url: 'https://www.kabum.com.br/busca/nzxt-h5-flow', store: 'kabum', category: 'case', name: 'NZXT H5 Flow', target_price: 450 },
  { url: 'https://www.pichau.com.br/search?q=nzxt+h5+flow', store: 'pichau', category: 'case', name: 'NZXT H5 Flow', target_price: 450 },

  // --- Corsair 4000D Airflow ---
  { url: 'https://www.kabum.com.br/busca/corsair-4000d-airflow', store: 'kabum', category: 'case', name: 'Corsair 4000D Airflow Mid-Tower', target_price: 400 },
  { url: 'https://www.pichau.com.br/search?q=corsair+4000d+airflow', store: 'pichau', category: 'case', name: 'Corsair 4000D Airflow Mid-Tower', target_price: 400 },

  // --- Lian Li Lancool 216 ---
  { url: 'https://www.kabum.com.br/busca/lancool-216', store: 'kabum', category: 'case', name: 'Lian Li Lancool 216 Mid-Tower', target_price: 500 },
  { url: 'https://www.pichau.com.br/search?q=lancool+216', store: 'pichau', category: 'case', name: 'Lian Li Lancool 216 Mid-Tower', target_price: 500 },

  // --- Aerocool Cylon ---
  { url: 'https://www.kabum.com.br/busca/aerocool-cylon', store: 'kabum', category: 'case', name: 'Aerocool Cylon Mid-Tower RGB', target_price: 180 },
  { url: 'https://www.terabyteshop.com.br/busca?str=aerocool+cylon', store: 'terabyte', category: 'case', name: 'Aerocool Cylon Mid-Tower RGB', target_price: 180 },

  // ═══════════════════════════════════════════
  // 🖵 Monitores — Gaming 144Hz+ (DP/HDMI, compatível RX 7600 / RTX 4060)
  // ═══════════════════════════════════════════

  // --- 1080p 144Hz IPS (custo-benefício) ---
  { url: 'https://www.kabum.com.br/busca/monitor-24-144hz-ips', store: 'kabum', category: 'monitor', name: 'Monitor 24" 144Hz IPS 1080p', target_price: 700 },
  { url: 'https://www.pichau.com.br/search?q=monitor+24+144hz+ips', store: 'pichau', category: 'monitor', name: 'Monitor 24" 144Hz IPS 1080p', target_price: 700 },

  // --- LG 24GS60F 24" 180Hz IPS ---
  { url: 'https://www.kabum.com.br/busca/lg-24gs60f', store: 'kabum', category: 'monitor', name: 'LG 24GS60F 24" 180Hz IPS FreeSync', target_price: 800 },
  { url: 'https://www.pichau.com.br/search?q=lg+24gs60f', store: 'pichau', category: 'monitor', name: 'LG 24GS60F 24" 180Hz IPS FreeSync', target_price: 800 },
  { url: 'https://www.terabyteshop.com.br/busca?str=lg+24gs60f', store: 'terabyte', category: 'monitor', name: 'LG 24GS60F 24" 180Hz IPS FreeSync', target_price: 800 },

  // --- AOC 24G2E 24" 165Hz IPS ---
  { url: 'https://www.kabum.com.br/busca/aoc-24g2e', store: 'kabum', category: 'monitor', name: 'AOC 24G2E 24" 165Hz IPS FreeSync', target_price: 750 },
  { url: 'https://www.pichau.com.br/search?q=aoc+24g2e', store: 'pichau', category: 'monitor', name: 'AOC 24G2E 24" 165Hz IPS FreeSync', target_price: 750 },

  // --- Redragon Jade 27" 165Hz IPS ---
  { url: 'https://www.kabum.com.br/busca/redragon-jade-27', store: 'kabum', category: 'monitor', name: 'Redragon Jade 27" 165Hz IPS 1080p', target_price: 850 },
  { url: 'https://www.pichau.com.br/search?q=redragon+jade+27', store: 'pichau', category: 'monitor', name: 'Redragon Jade 27" 165Hz IPS 1080p', target_price: 850 },

  // --- 1440p 144Hz+ (upgrade — ideal pra RX 7600 XT / RTX 4060 Ti) ---
  { url: 'https://www.kabum.com.br/busca/monitor-27-1440p-144hz', store: 'kabum', category: 'monitor', name: 'Monitor 27" 1440p 144Hz+ IPS', target_price: 1200 },
  { url: 'https://www.pichau.com.br/search?q=monitor+27+1440p+144hz', store: 'pichau', category: 'monitor', name: 'Monitor 27" 1440p 144Hz+ IPS', target_price: 1200 },

  // --- LG 27GP850-B 27" 1440p 165Hz Nano IPS ---
  { url: 'https://www.kabum.com.br/busca/lg-27gp850', store: 'kabum', category: 'monitor', name: 'LG 27GP850-B 27" 1440p 165Hz Nano IPS', target_price: 1500 },
  { url: 'https://www.pichau.com.br/search?q=lg+27gp850', store: 'pichau', category: 'monitor', name: 'LG 27GP850-B 27" 1440p 165Hz Nano IPS', target_price: 1500 },

  // --- Gigabyte M27Q 27" 1440p 170Hz ---
  { url: 'https://www.kabum.com.br/busca/gigabyte-m27q', store: 'kabum', category: 'monitor', name: 'Gigabyte M27Q 27" 1440p 170Hz IPS', target_price: 1300 },
  { url: 'https://www.pichau.com.br/search?q=gigabyte+m27q', store: 'pichau', category: 'monitor', name: 'Gigabyte M27Q 27" 1440p 170Hz IPS', target_price: 1300 },

  // --- ASUS VG27AQ1A 27" 1440p 170Hz ---
  { url: 'https://www.kabum.com.br/busca/asus-vg27aq1a', store: 'kabum', category: 'monitor', name: 'ASUS TUF VG27AQ1A 27" 1440p 170Hz', target_price: 1400 },

  // ═══════════════════════════════════════════
  // ❄️ Coolers Extras — AIO e Tower (AM5)
  // ═══════════════════════════════════════════

  // --- DeepCool AK400 (tower, excelente custo-benefício AM5) ---
  { url: 'https://www.kabum.com.br/busca/deepcool-ak400', store: 'kabum', category: 'cooler', name: 'DeepCool AK400 Tower (AM5)', target_price: 130 },
  { url: 'https://www.pichau.com.br/search?q=deepcool+ak400', store: 'pichau', category: 'cooler', name: 'DeepCool AK400 Tower (AM5)', target_price: 130 },
  { url: 'https://www.terabyteshop.com.br/busca?str=deepcool+ak400', store: 'terabyte', category: 'cooler', name: 'DeepCool AK400 Tower (AM5)', target_price: 130 },

  // --- DeepCool AK620 (dual tower, pra Ryzen 7) ---
  { url: 'https://www.kabum.com.br/busca/deepcool-ak620', store: 'kabum', category: 'cooler', name: 'DeepCool AK620 Dual Tower (AM5)', target_price: 250 },
  { url: 'https://www.pichau.com.br/search?q=deepcool+ak620', store: 'pichau', category: 'cooler', name: 'DeepCool AK620 Dual Tower (AM5)', target_price: 250 },

  // --- Thermalright Peerless Assassin 120 SE ---
  { url: 'https://www.kabum.com.br/busca/thermalright-peerless-assassin-120', store: 'kabum', category: 'cooler', name: 'Thermalright Peerless Assassin 120 SE (AM5)', target_price: 160 },
  { url: 'https://www.pichau.com.br/search?q=thermalright+peerless+assassin', store: 'pichau', category: 'cooler', name: 'Thermalright Peerless Assassin 120 SE (AM5)', target_price: 160 },

  // --- AIO DeepCool LE500 240mm ---
  { url: 'https://www.kabum.com.br/busca/deepcool-le500-240', store: 'kabum', category: 'cooler', name: 'DeepCool LE500 AIO 240mm (AM5)', target_price: 280 },
  { url: 'https://www.pichau.com.br/search?q=deepcool+le500+240', store: 'pichau', category: 'cooler', name: 'DeepCool LE500 AIO 240mm (AM5)', target_price: 280 },

  // --- AIO Cooler Master MasterLiquid ML240L V2 ---
  { url: 'https://www.kabum.com.br/busca/masterliquid-ml240l-v2', store: 'kabum', category: 'cooler', name: 'Cooler Master ML240L V2 AIO 240mm RGB (AM5)', target_price: 350 },
  { url: 'https://www.pichau.com.br/search?q=masterliquid+ml240l', store: 'pichau', category: 'cooler', name: 'Cooler Master ML240L V2 AIO 240mm RGB (AM5)', target_price: 350 },

  // ═══════════════════════════════════════════
  // 🔋 Fontes Extras — 700W+ (headroom pra GPUs maiores)
  // ═══════════════════════════════════════════

  // --- Corsair RM750 750W 80+ Gold Full Modular ---
  { url: 'https://www.kabum.com.br/busca/corsair-rm750', store: 'kabum', category: 'psu', name: 'Corsair RM750 750W 80+ Gold Full Modular', target_price: 500 },
  { url: 'https://www.pichau.com.br/search?q=corsair+rm750', store: 'pichau', category: 'psu', name: 'Corsair RM750 750W 80+ Gold Full Modular', target_price: 500 },
  { url: 'https://www.terabyteshop.com.br/busca?str=corsair+rm750', store: 'terabyte', category: 'psu', name: 'Corsair RM750 750W 80+ Gold Full Modular', target_price: 500 },

  // --- EVGA SuperNOVA 700W 80+ Gold ---
  { url: 'https://www.kabum.com.br/busca/evga-supernova-700', store: 'kabum', category: 'psu', name: 'EVGA SuperNOVA 700W 80+ Gold', target_price: 380 },
  { url: 'https://www.pichau.com.br/search?q=evga+supernova+700', store: 'pichau', category: 'psu', name: 'EVGA SuperNOVA 700W 80+ Gold', target_price: 380 },

  // --- Cooler Master MWE 750W 80+ Gold V2 ---
  { url: 'https://www.kabum.com.br/busca/cooler-master-mwe-750-gold', store: 'kabum', category: 'psu', name: 'Cooler Master MWE 750W 80+ Gold V2', target_price: 450 },
  { url: 'https://www.pichau.com.br/search?q=cooler+master+mwe+750+gold', store: 'pichau', category: 'psu', name: 'Cooler Master MWE 750W 80+ Gold V2', target_price: 450 },

  // ═══════════════════════════════════════════
  // 🔌 Placas-Mãe Extras — AM5 (B650E / X670)
  // ═══════════════════════════════════════════

  // --- MSI MAG B650 TOMAHAWK WiFi (ATX premium) ---
  { url: 'https://www.kabum.com.br/busca/b650-tomahawk-wifi', store: 'kabum', category: 'motherboard', name: 'MSI MAG B650 TOMAHAWK WiFi (ATX)', target_price: 1200 },
  { url: 'https://www.pichau.com.br/search?q=msi+b650+tomahawk', store: 'pichau', category: 'motherboard', name: 'MSI MAG B650 TOMAHAWK WiFi (ATX)', target_price: 1200 },

  // --- Gigabyte B650M AORUS Elite AX (mATX premium WiFi) ---
  { url: 'https://www.kabum.com.br/busca/b650m-aorus-elite-ax', store: 'kabum', category: 'motherboard', name: 'Gigabyte B650M AORUS Elite AX (mATX WiFi)', target_price: 950 },
  { url: 'https://www.pichau.com.br/search?q=b650m+aorus+elite+ax', store: 'pichau', category: 'motherboard', name: 'Gigabyte B650M AORUS Elite AX (mATX WiFi)', target_price: 950 },

  // --- ASRock B650M PG Riptide WiFi ---
  { url: 'https://www.kabum.com.br/busca/b650m-pg-riptide', store: 'kabum', category: 'motherboard', name: 'ASRock B650M PG Riptide WiFi (mATX)', target_price: 800 },
  { url: 'https://www.pichau.com.br/search?q=asrock+b650m+riptide', store: 'pichau', category: 'motherboard', name: 'ASRock B650M PG Riptide WiFi (mATX)', target_price: 800 },

  // ═══════════════════════════════════════════
  // 💾 RAM Extras — DDR5 2x16GB 6000MHz (sweet spot AM5)
  // ═══════════════════════════════════════════

  // --- Kingston Fury Beast DDR5 32GB 6000MHz ---
  { url: 'https://www.kabum.com.br/busca/kingston-fury-beast-ddr5-32gb-6000', store: 'kabum', category: 'ram2x16', name: 'Kingston Fury Beast DDR5 32GB (2x16) 6000MHz', target_price: 800 },
  { url: 'https://www.pichau.com.br/search?q=fury+beast+ddr5+32gb+6000', store: 'pichau', category: 'ram2x16', name: 'Kingston Fury Beast DDR5 32GB (2x16) 6000MHz', target_price: 800 },

  // --- Corsair Vengeance DDR5 32GB 6000MHz ---
  { url: 'https://www.kabum.com.br/busca/corsair-vengeance-ddr5-32gb-6000', store: 'kabum', category: 'ram2x16', name: 'Corsair Vengeance DDR5 32GB (2x16) 6000MHz', target_price: 850 },
  { url: 'https://www.pichau.com.br/search?q=corsair+vengeance+ddr5+32gb+6000', store: 'pichau', category: 'ram2x16', name: 'Corsair Vengeance DDR5 32GB (2x16) 6000MHz', target_price: 850 },

  // --- Crucial DDR5 32GB 5600MHz (budget) ---
  { url: 'https://www.kabum.com.br/busca/crucial-ddr5-32gb-5600', store: 'kabum', category: 'ram2x16', name: 'Crucial DDR5 32GB (2x16) 5600MHz', target_price: 600 },
  { url: 'https://www.pichau.com.br/search?q=crucial+ddr5+32gb+5600', store: 'pichau', category: 'ram2x16', name: 'Crucial DDR5 32GB (2x16) 5600MHz', target_price: 600 },
  { url: 'https://www.terabyteshop.com.br/busca?str=crucial+ddr5+32gb+5600', store: 'terabyte', category: 'ram2x16', name: 'Crucial DDR5 32GB (2x16) 5600MHz', target_price: 600 },

  // ═══════════════════════════════════════════
  // ⌨️ Periféricos — Mouse, Teclado, Headset
  // ═══════════════════════════════════════════

  // --- Mouses ---
  { url: 'https://www.kabum.com.br/busca/logitech-g203', store: 'kabum', category: 'mouse', name: 'Logitech G203 LIGHTSYNC Mouse', target_price: 100 },
  { url: 'https://www.kabum.com.br/busca/logitech-g305', store: 'kabum', category: 'mouse', name: 'Logitech G305 Mouse Wireless', target_price: 180 },
  { url: 'https://www.kabum.com.br/busca/razer-deathadder-essential', store: 'kabum', category: 'mouse', name: 'Razer DeathAdder Essential Mouse', target_price: 100 },
  { url: 'https://www.kabum.com.br/busca/razer-viper-mini', store: 'kabum', category: 'mouse', name: 'Razer Viper Mini Mouse', target_price: 130 },
  { url: 'https://www.kabum.com.br/busca/redragon-cobra', store: 'kabum', category: 'mouse', name: 'Redragon Cobra M711 Mouse RGB', target_price: 80 },

  // --- Teclados Mecânicos ---
  { url: 'https://www.kabum.com.br/busca/redragon-kumara-k552', store: 'kabum', category: 'keyboard', name: 'Redragon Kumara K552 TKL Mecânico RGB', target_price: 150 },
  { url: 'https://www.kabum.com.br/busca/logitech-g413-se', store: 'kabum', category: 'keyboard', name: 'Logitech G413 SE Teclado Mecânico', target_price: 250 },
  { url: 'https://www.kabum.com.br/busca/hyperx-alloy-origins-core', store: 'kabum', category: 'keyboard', name: 'HyperX Alloy Origins Core TKL Mecânico', target_price: 300 },
  { url: 'https://www.kabum.com.br/busca/redragon-dark-avenger-k568', store: 'kabum', category: 'keyboard', name: 'Redragon Dark Avenger K568 Mecânico RGB', target_price: 180 },

  // --- Headsets ---
  { url: 'https://www.kabum.com.br/busca/hyperx-cloud-stinger-2', store: 'kabum', category: 'headset', name: 'HyperX Cloud Stinger 2 Headset', target_price: 200 },
  { url: 'https://www.kabum.com.br/busca/logitech-g435', store: 'kabum', category: 'headset', name: 'Logitech G435 Headset Wireless', target_price: 300 },
  { url: 'https://www.kabum.com.br/busca/redragon-zeus-x-h510', store: 'kabum', category: 'headset', name: 'Redragon Zeus X H510 Headset 7.1', target_price: 200 },
  { url: 'https://www.kabum.com.br/busca/havit-h2002d', store: 'kabum', category: 'headset', name: 'Havit H2002D Headset Gamer', target_price: 100 },

  // --- Mousepads ---
  { url: 'https://www.kabum.com.br/busca/mousepad-gamer-grande', store: 'kabum', category: 'mousepad', name: 'Mousepad Gamer Grande 70x30cm', target_price: 40 },

  // ═══════════════════════════════════════════
  // 🔧 Acessórios — Pasta Térmica, Ventoinhas, Cabos
  // ═══════════════════════════════════════════

  // --- Pasta Térmica ---
  { url: 'https://www.kabum.com.br/busca/thermal-grizzly-kryonaut', store: 'kabum', category: 'other', name: 'Thermal Grizzly Kryonaut 1g', target_price: 50 },
  { url: 'https://www.kabum.com.br/busca/arctic-mx-4', store: 'kabum', category: 'other', name: 'Arctic MX-4 4g Pasta Térmica', target_price: 40 },
  { url: 'https://www.pichau.com.br/search?q=arctic+mx-4', store: 'pichau', category: 'other', name: 'Arctic MX-4 4g Pasta Térmica', target_price: 40 },
  { url: 'https://www.kabum.com.br/busca/noctua-nt-h1', store: 'kabum', category: 'other', name: 'Noctua NT-H1 Pasta Térmica 3.5g', target_price: 45 },

  // --- Kit Ventoinhas (fans compatíveis com gabinetes) ---
  { url: 'https://www.kabum.com.br/busca/kit-fan-120mm-argb', store: 'kabum', category: 'other', name: 'Kit 3x Fan 120mm ARGB', target_price: 100 },
  { url: 'https://www.pichau.com.br/search?q=kit+fan+120mm+argb', store: 'pichau', category: 'other', name: 'Kit 3x Fan 120mm ARGB', target_price: 100 },
  { url: 'https://www.kabum.com.br/busca/deepcool-rf120-3in1', store: 'kabum', category: 'other', name: 'DeepCool RF120 Kit 3x Fan 120mm ARGB', target_price: 120 },
  { url: 'https://www.kabum.com.br/busca/cooler-master-sickleflow-120-argb-3in1', store: 'kabum', category: 'other', name: 'CM SickleFlow 120 ARGB Kit 3x Fan', target_price: 150 },

  // --- Cabos (essenciais, muitas vezes esquecidos) ---
  { url: 'https://www.kabum.com.br/busca/cabo-displayport-1.4', store: 'kabum', category: 'other', name: 'Cabo DisplayPort 1.4 2m (4K 144Hz)', target_price: 35 },
  { url: 'https://www.kabum.com.br/busca/cabo-hdmi-2.1', store: 'kabum', category: 'other', name: 'Cabo HDMI 2.1 2m (4K 120Hz)', target_price: 50 },

  // ═══════════════════════════════════════════
  // 🎙️ Streaming & Conectividade
  // ═══════════════════════════════════════════

  // --- Webcams ---
  { url: 'https://www.kabum.com.br/busca/logitech-c920', store: 'kabum', category: 'webcam', name: 'Logitech C920 Full HD', target_price: 350 },
  { url: 'https://www.pichau.com.br/search?q=logitech+c920', store: 'pichau', category: 'webcam', name: 'Logitech C920 Full HD', target_price: 350 },

  // --- Microfones ---
  { url: 'https://www.kabum.com.br/busca/hyperx-solocast', store: 'kabum', category: 'microphone', name: 'HyperX SoloCast', target_price: 250 },
  { url: 'https://www.pichau.com.br/search?q=hyperx+solocast', store: 'pichau', category: 'microphone', name: 'HyperX SoloCast', target_price: 250 },

  // --- Adaptadores WiFi ---
  { url: 'https://www.kabum.com.br/busca/tp-link-archer-t3u', store: 'kabum', category: 'wifi_adapter', name: 'TP-Link Archer T3U Plus AC1300', target_price: 120 },
  { url: 'https://www.pichau.com.br/search?q=tp-link+archer+t3u', store: 'pichau', category: 'wifi_adapter', name: 'TP-Link Archer T3U Plus AC1300', target_price: 120 },

  // ═══════════════════════════════════════════
  // ⚡ NVMe Extras — Opções 4TB e high-speed
  // ═══════════════════════════════════════════

  // --- WD Black SN770 1TB PCIe 4.0 (alta performance) ---
  { url: 'https://www.kabum.com.br/busca/wd-black-sn770-1tb', store: 'kabum', category: 'nvme', name: 'WD Black SN770 1TB NVMe PCIe 4.0', target_price: 450 },
  { url: 'https://www.pichau.com.br/search?q=wd+black+sn770+1tb', store: 'pichau', category: 'nvme', name: 'WD Black SN770 1TB NVMe PCIe 4.0', target_price: 450 },

  // --- Samsung 990 EVO 1TB PCIe 5.0 (futuro-proof) ---
  { url: 'https://www.kabum.com.br/busca/samsung-990-evo-1tb', store: 'kabum', category: 'nvme', name: 'Samsung 990 EVO 1TB NVMe PCIe 5.0', target_price: 550 },
  { url: 'https://www.pichau.com.br/search?q=samsung+990+evo+1tb', store: 'pichau', category: 'nvme', name: 'Samsung 990 EVO 1TB NVMe PCIe 5.0', target_price: 550 },

  // --- WD Black SN770 2TB ---
  { url: 'https://www.kabum.com.br/busca/wd-black-sn770-2tb', store: 'kabum', category: 'nvme', name: 'WD Black SN770 2TB NVMe PCIe 4.0', target_price: 800 },
  { url: 'https://www.pichau.com.br/search?q=wd+black+sn770+2tb', store: 'pichau', category: 'nvme', name: 'WD Black SN770 2TB NVMe PCIe 4.0', target_price: 800 },

  // ═══════════════════════════════════════════════════
  // 🧠 CPUs Extras — AM5 (APUs e high-end)
  // ═══════════════════════════════════════════════════

  // --- Ryzen 5 8500G (APU AM5, tem iGPU) ---
  { url: 'https://www.kabum.com.br/busca/ryzen-5-8500g', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 5 8500G (APU, iGPU Radeon 740M)', target_price: 900 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+5+8500g', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 5 8500G (APU, iGPU Radeon 740M)', target_price: 900 },
  { url: 'https://www.terabyteshop.com.br/busca?str=ryzen+5+8500g', store: 'terabyte', category: 'cpu', name: 'AMD Ryzen 5 8500G (APU, iGPU Radeon 740M)', target_price: 900 },

  // --- Ryzen 5 8600G (APU AM5, melhor iGPU) ---
  { url: 'https://www.kabum.com.br/busca/ryzen-5-8600g', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 5 8600G (APU, iGPU Radeon 760M)', target_price: 1100 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+5+8600g', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 5 8600G (APU, iGPU Radeon 760M)', target_price: 1100 },
  { url: 'https://www.terabyteshop.com.br/busca?str=ryzen+5+8600g', store: 'terabyte', category: 'cpu', name: 'AMD Ryzen 5 8600G (APU, iGPU Radeon 760M)', target_price: 1100 },

  // --- Ryzen 9 7900 (12C/24T, produtividade) ---
  { url: 'https://www.kabum.com.br/busca/ryzen-9-7900', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 9 7900 12C/24T', target_price: 1800 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+9+7900', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 9 7900 12C/24T', target_price: 1800 },

  // --- Ryzen 9 7900X (12C/24T, desbloqueado) ---
  { url: 'https://www.kabum.com.br/busca/ryzen-9-7900x', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 9 7900X 12C/24T', target_price: 2000 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+9+7900x', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 9 7900X 12C/24T', target_price: 2000 },
  { url: 'https://www.terabyteshop.com.br/busca?str=ryzen+9+7900x', store: 'terabyte', category: 'cpu', name: 'AMD Ryzen 9 7900X 12C/24T', target_price: 2000 },

  // --- CPUs em Amazon/ML (comparação de preço) ---
  { url: 'https://www.amazon.com.br/Processador-Ryzen-7500F-Core-Thread/dp/B0FP64XTTZ/', store: 'amazon', category: 'cpu', name: 'AMD Ryzen 5 7500F (Amazon)', target_price: 800 },
  { url: 'https://www.amazon.com.br/s?k=ryzen+5+7600x', store: 'amazon', category: 'cpu', name: 'AMD Ryzen 5 7600X (Amazon)', target_price: 1050 },
  { url: 'https://www.amazon.com.br/Processador-AMD-Ryzen-7800X3D-Threads/dp/B0BTZB7F88/', store: 'amazon', category: 'cpu', name: 'AMD Ryzen 7 7800X3D (Amazon)', target_price: 2200 },
  { url: 'https://lista.mercadolivre.com.br/ryzen-5-7500f', store: 'mercadolivre', category: 'cpu', name: 'AMD Ryzen 5 7500F (ML)', target_price: 780 },
  { url: 'https://lista.mercadolivre.com.br/ryzen-7-7800x3d', store: 'mercadolivre', category: 'cpu', name: 'AMD Ryzen 7 7800X3D (ML)', target_price: 2100 },

  // ═══════════════════════════════════════════════════
  // 🎮 GPUs Extras — Modelos por fabricante (compatíveis com B650 PCIe 4.0)
  // ═══════════════════════════════════════════════════

  // --- RX 7600 — por fabricante ---
  { url: 'https://www.kabum.com.br/busca/sapphire-pulse-rx-7600', store: 'kabum', category: 'gpu', name: 'Sapphire PULSE RX 7600 8GB', target_price: 1300 },
  { url: 'https://www.pichau.com.br/search?q=sapphire+pulse+rx+7600', store: 'pichau', category: 'gpu', name: 'Sapphire PULSE RX 7600 8GB', target_price: 1300 },
  { url: 'https://www.kabum.com.br/busca/xfx-speedster-rx-7600', store: 'kabum', category: 'gpu', name: 'XFX Speedster SWFT 210 RX 7600 8GB', target_price: 1280 },
  { url: 'https://www.pichau.com.br/search?q=xfx+rx+7600', store: 'pichau', category: 'gpu', name: 'XFX Speedster SWFT 210 RX 7600 8GB', target_price: 1280 },
  { url: 'https://www.kabum.com.br/busca/msi-mech-rx-7600', store: 'kabum', category: 'gpu', name: 'MSI Radeon RX 7600 MECH 2X 8GB', target_price: 1350 },
  { url: 'https://www.kabum.com.br/busca/gigabyte-eagle-rx-7600', store: 'kabum', category: 'gpu', name: 'Gigabyte RX 7600 EAGLE OC 8GB', target_price: 1350 },
  { url: 'https://www.kabum.com.br/busca/asrock-challenger-rx-7600', store: 'kabum', category: 'gpu', name: 'ASRock RX 7600 Challenger 8GB', target_price: 1250 },
  { url: 'https://www.pichau.com.br/search?q=asrock+challenger+rx+7600', store: 'pichau', category: 'gpu', name: 'ASRock RX 7600 Challenger 8GB', target_price: 1250 },
  { url: 'https://www.kabum.com.br/busca/powercolor-fighter-rx-7600', store: 'kabum', category: 'gpu', name: 'PowerColor Fighter RX 7600 8GB', target_price: 1280 },
  { url: 'https://www.pichau.com.br/search?q=powercolor+fighter+rx+7600', store: 'pichau', category: 'gpu', name: 'PowerColor Fighter RX 7600 8GB', target_price: 1280 },

  // --- RX 7600 XT — por fabricante ---
  { url: 'https://www.kabum.com.br/busca/sapphire-nitro-rx-7600-xt', store: 'kabum', category: 'gpu', name: 'Sapphire NITRO+ RX 7600 XT 16GB', target_price: 1800 },
  { url: 'https://www.pichau.com.br/search?q=sapphire+rx+7600+xt', store: 'pichau', category: 'gpu', name: 'Sapphire NITRO+ RX 7600 XT 16GB', target_price: 1800 },
  { url: 'https://www.kabum.com.br/busca/xfx-speedster-rx-7600-xt', store: 'kabum', category: 'gpu', name: 'XFX Speedster SWFT 210 RX 7600 XT 16GB', target_price: 1750 },
  { url: 'https://www.kabum.com.br/busca/powercolor-hellhound-rx-7600-xt', store: 'kabum', category: 'gpu', name: 'PowerColor Hellhound RX 7600 XT 16GB', target_price: 1780 },

  // --- RTX 4060 — por fabricante ---
  { url: 'https://www.kabum.com.br/busca/asus-dual-rtx-4060', store: 'kabum', category: 'gpu', name: 'ASUS Dual GeForce RTX 4060 8GB', target_price: 1700 },
  { url: 'https://www.pichau.com.br/search?q=asus+dual+rtx+4060', store: 'pichau', category: 'gpu', name: 'ASUS Dual GeForce RTX 4060 8GB', target_price: 1700 },
  { url: 'https://www.kabum.com.br/busca/msi-ventus-rtx-4060', store: 'kabum', category: 'gpu', name: 'MSI GeForce RTX 4060 Ventus 2X 8GB', target_price: 1680 },
  { url: 'https://www.pichau.com.br/search?q=msi+ventus+rtx+4060', store: 'pichau', category: 'gpu', name: 'MSI GeForce RTX 4060 Ventus 2X 8GB', target_price: 1680 },
  { url: 'https://www.kabum.com.br/busca/gigabyte-eagle-rtx-4060', store: 'kabum', category: 'gpu', name: 'Gigabyte GeForce RTX 4060 Eagle OC 8GB', target_price: 1700 },
  { url: 'https://www.kabum.com.br/busca/galax-ex-rtx-4060', store: 'kabum', category: 'gpu', name: 'GALAX GeForce RTX 4060 EX 1-Click OC 8GB', target_price: 1650 },
  { url: 'https://www.pichau.com.br/search?q=galax+rtx+4060', store: 'pichau', category: 'gpu', name: 'GALAX GeForce RTX 4060 EX 1-Click OC 8GB', target_price: 1650 },

  // --- RTX 4060 Ti — por fabricante ---
  { url: 'https://www.kabum.com.br/busca/asus-dual-rtx-4060-ti', store: 'kabum', category: 'gpu', name: 'ASUS Dual GeForce RTX 4060 Ti 8GB', target_price: 2300 },
  { url: 'https://www.kabum.com.br/busca/msi-gaming-x-rtx-4060-ti', store: 'kabum', category: 'gpu', name: 'MSI GeForce RTX 4060 Ti Gaming X 8GB', target_price: 2400 },
  { url: 'https://www.kabum.com.br/busca/gigabyte-gaming-oc-rtx-4060-ti', store: 'kabum', category: 'gpu', name: 'Gigabyte GeForce RTX 4060 Ti Gaming OC 8GB', target_price: 2350 },

  // --- RX 7700 XT — por fabricante ---
  { url: 'https://www.kabum.com.br/busca/sapphire-nitro-rx-7700-xt', store: 'kabum', category: 'gpu', name: 'Sapphire NITRO+ RX 7700 XT 12GB', target_price: 2200 },
  { url: 'https://www.kabum.com.br/busca/xfx-speedster-rx-7700-xt', store: 'kabum', category: 'gpu', name: 'XFX Speedster QICK 319 RX 7700 XT 12GB', target_price: 2150 },
  { url: 'https://www.pichau.com.br/search?q=xfx+rx+7700+xt', store: 'pichau', category: 'gpu', name: 'XFX Speedster QICK 319 RX 7700 XT 12GB', target_price: 2150 },
  { url: 'https://www.kabum.com.br/busca/powercolor-red-devil-rx-7700-xt', store: 'kabum', category: 'gpu', name: 'PowerColor Red Devil RX 7700 XT 12GB', target_price: 2300 },

  // --- GPUs em Amazon/ML ---
  { url: 'https://www.amazon.com.br/s?k=rx+7600+8gb', store: 'amazon', category: 'gpu', name: 'AMD RX 7600 8GB (Amazon)', target_price: 1300 },
  { url: 'https://www.amazon.com.br/s?k=rtx+4060+8gb', store: 'amazon', category: 'gpu', name: 'RTX 4060 8GB (Amazon)', target_price: 1700 },
  { url: 'https://lista.mercadolivre.com.br/rx-7600-8gb', store: 'mercadolivre', category: 'gpu', name: 'AMD RX 7600 8GB (ML)', target_price: 1250 },
  { url: 'https://lista.mercadolivre.com.br/rtx-4060-8gb', store: 'mercadolivre', category: 'gpu', name: 'RTX 4060 8GB (ML)', target_price: 1650 },

  // ═══════════════════════════════════════════════════
  // 🔌 Placas-Mãe Extras — AM5 modelos específicos
  // ═══════════════════════════════════════════════════

  // --- ASUS TUF GAMING B650M-PLUS WiFi ---
  { url: 'https://www.kabum.com.br/busca/asus-tuf-b650m-plus-wifi', store: 'kabum', category: 'motherboard', name: 'ASUS TUF GAMING B650M-PLUS WiFi (mATX)', target_price: 950 },
  { url: 'https://www.pichau.com.br/search?q=asus+tuf+b650m+plus+wifi', store: 'pichau', category: 'motherboard', name: 'ASUS TUF GAMING B650M-PLUS WiFi (mATX)', target_price: 950 },
  { url: 'https://www.terabyteshop.com.br/busca?str=asus+tuf+b650m+plus+wifi', store: 'terabyte', category: 'motherboard', name: 'ASUS TUF GAMING B650M-PLUS WiFi (mATX)', target_price: 950 },

  // --- Gigabyte B650M GAMING X AX ---
  { url: 'https://www.kabum.com.br/busca/b650m-gaming-x-ax', store: 'kabum', category: 'motherboard', name: 'Gigabyte B650M GAMING X AX (mATX WiFi)', target_price: 900 },
  { url: 'https://www.pichau.com.br/search?q=gigabyte+b650m+gaming+x+ax', store: 'pichau', category: 'motherboard', name: 'Gigabyte B650M GAMING X AX (mATX WiFi)', target_price: 900 },

  // --- MSI B650M GAMING WiFi ---
  { url: 'https://www.kabum.com.br/busca/msi-b650m-gaming-wifi', store: 'kabum', category: 'motherboard', name: 'MSI B650M GAMING WiFi (mATX)', target_price: 880 },
  { url: 'https://www.pichau.com.br/search?q=msi+b650m+gaming+wifi', store: 'pichau', category: 'motherboard', name: 'MSI B650M GAMING WiFi (mATX)', target_price: 880 },

  // --- ASRock B650 LiveMixer (ATX) ---
  { url: 'https://www.kabum.com.br/busca/asrock-b650-livemixer', store: 'kabum', category: 'motherboard', name: 'ASRock B650 LiveMixer (ATX)', target_price: 1000 },
  { url: 'https://www.pichau.com.br/search?q=asrock+b650+livemixer', store: 'pichau', category: 'motherboard', name: 'ASRock B650 LiveMixer (ATX)', target_price: 1000 },

  // --- ASUS ROG STRIX B650-A Gaming WiFi (premium) ---
  { url: 'https://www.kabum.com.br/busca/rog-strix-b650-a-gaming-wifi', store: 'kabum', category: 'motherboard', name: 'ASUS ROG STRIX B650-A Gaming WiFi (ATX)', target_price: 1400 },
  { url: 'https://www.pichau.com.br/search?q=rog+strix+b650+a+wifi', store: 'pichau', category: 'motherboard', name: 'ASUS ROG STRIX B650-A Gaming WiFi (ATX)', target_price: 1400 },

  // --- Mobos em Amazon/ML ---
  { url: 'https://www.amazon.com.br/s?k=placa+mae+b650m+am5', store: 'amazon', category: 'motherboard', name: 'Placa-Mãe B650M AM5 (Amazon)', target_price: 700 },
  { url: 'https://lista.mercadolivre.com.br/placa-mae-b650m-am5', store: 'mercadolivre', category: 'motherboard', name: 'Placa-Mãe B650M AM5 (ML)', target_price: 680 },

  // ═══════════════════════════════════════════════════
  // 💾 RAM Extras — DDR5 2x16GB marcas alternativas
  // ═══════════════════════════════════════════════════

  // --- TeamGroup T-Force Vulcan DDR5 32GB 5600MHz ---
  { url: 'https://www.kabum.com.br/busca/teamgroup-vulcan-ddr5-32gb-5600', store: 'kabum', category: 'ram2x16', name: 'TeamGroup T-Force Vulcan DDR5 32GB (2x16) 5600MHz', target_price: 620 },
  { url: 'https://www.pichau.com.br/search?q=teamgroup+vulcan+ddr5+32gb', store: 'pichau', category: 'ram2x16', name: 'TeamGroup T-Force Vulcan DDR5 32GB (2x16) 5600MHz', target_price: 620 },
  { url: 'https://www.terabyteshop.com.br/busca?str=teamgroup+vulcan+ddr5+32gb', store: 'terabyte', category: 'ram2x16', name: 'TeamGroup T-Force Vulcan DDR5 32GB (2x16) 5600MHz', target_price: 620 },

  // --- TeamGroup T-Force Delta DDR5 32GB 6000MHz RGB ---
  { url: 'https://www.kabum.com.br/busca/teamgroup-delta-ddr5-32gb-6000', store: 'kabum', category: 'ram2x16', name: 'TeamGroup T-Force Delta DDR5 32GB (2x16) 6000MHz RGB', target_price: 850 },
  { url: 'https://www.pichau.com.br/search?q=teamgroup+delta+ddr5+32gb+6000', store: 'pichau', category: 'ram2x16', name: 'TeamGroup T-Force Delta DDR5 32GB (2x16) 6000MHz RGB', target_price: 850 },

  // --- Patriot Viper Venom DDR5 32GB 5600MHz ---
  { url: 'https://www.kabum.com.br/busca/patriot-viper-venom-ddr5-32gb-5600', store: 'kabum', category: 'ram2x16', name: 'Patriot Viper Venom DDR5 32GB (2x16) 5600MHz', target_price: 650 },
  { url: 'https://www.pichau.com.br/search?q=patriot+viper+venom+ddr5+32gb', store: 'pichau', category: 'ram2x16', name: 'Patriot Viper Venom DDR5 32GB (2x16) 5600MHz', target_price: 650 },

  // --- Lexar THOR DDR5 32GB 6000MHz ---
  { url: 'https://www.kabum.com.br/busca/lexar-thor-ddr5-32gb-6000', store: 'kabum', category: 'ram2x16', name: 'Lexar THOR DDR5 32GB (2x16) 6000MHz', target_price: 780 },
  { url: 'https://www.pichau.com.br/search?q=lexar+thor+ddr5+32gb', store: 'pichau', category: 'ram2x16', name: 'Lexar THOR DDR5 32GB (2x16) 6000MHz', target_price: 780 },

  // --- G.Skill Trident Z5 Neo DDR5 32GB 6000MHz (otimizada p/ AM5 EXPO) ---
  { url: 'https://www.kabum.com.br/busca/gskill-trident-z5-neo-ddr5-32gb-6000', store: 'kabum', category: 'ram2x16', name: 'G.Skill Trident Z5 Neo DDR5 32GB (2x16) 6000MHz EXPO', target_price: 1000 },
  { url: 'https://www.pichau.com.br/search?q=gskill+trident+z5+neo+ddr5+32gb', store: 'pichau', category: 'ram2x16', name: 'G.Skill Trident Z5 Neo DDR5 32GB (2x16) 6000MHz EXPO', target_price: 1000 },

  // --- RAM em Amazon/ML ---
  { url: 'https://www.amazon.com.br/s?k=ddr5+32gb+2x16+5600', store: 'amazon', category: 'ram2x16', name: 'DDR5 32GB (2x16) 5600MHz (Amazon)', target_price: 650 },
  { url: 'https://lista.mercadolivre.com.br/ddr5-32gb-2x16-5600', store: 'mercadolivre', category: 'ram2x16', name: 'DDR5 32GB (2x16) 5600MHz (ML)', target_price: 600 },

  // ═══════════════════════════════════════════════════
  // 💾 RAM (Módulos Individuais 1x16GB DDR5)
  // ═══════════════════════════════════════════════════

  // --- Kingston Fury Beast DDR5 16GB 5600MHz ---
  { url: 'https://www.kabum.com.br/busca/kingston-fury-beast-ddr5-16gb-5600', store: 'kabum', category: 'ram1x16', name: 'Kingston Fury Beast DDR5 16GB 5600MHz (1x16)', target_price: 360 },
  { url: 'https://www.pichau.com.br/search?q=kingston+fury+beast+ddr5+16gb', store: 'pichau', category: 'ram1x16', name: 'Kingston Fury Beast DDR5 16GB 5600MHz (1x16)', target_price: 360 },
  { url: 'https://www.terabyteshop.com.br/busca?str=kingston+fury+beast+ddr5+16gb', store: 'terabyte', category: 'ram1x16', name: 'Kingston Fury Beast DDR5 16GB 5600MHz (1x16)', target_price: 360 },

  // --- Corsair Vengeance DDR5 16GB 5600MHz ---
  { url: 'https://www.kabum.com.br/busca/corsair-vengeance-ddr5-16gb', store: 'kabum', category: 'ram1x16', name: 'Corsair Vengeance DDR5 16GB 5600MHz (1x16)', target_price: 380 },
  { url: 'https://www.pichau.com.br/search?q=corsair+vengeance+ddr5+16gb', store: 'pichau', category: 'ram1x16', name: 'Corsair Vengeance DDR5 16GB 5600MHz (1x16)', target_price: 380 },

  // --- XPG Lancer DDR5 16GB 5600MHz ---
  { url: 'https://www.kabum.com.br/busca/xpg-lancer-ddr5-16gb-5600', store: 'kabum', category: 'ram1x16', name: 'XPG Lancer DDR5 16GB 5600MHz (1x16)', target_price: 330 },
  { url: 'https://www.pichau.com.br/search?q=xpg+lancer+ddr5+16gb', store: 'pichau', category: 'ram1x16', name: 'XPG Lancer DDR5 16GB 5600MHz (1x16)', target_price: 330 },

  // --- Crucial DDR5 16GB 5600MHz (budget) ---
  { url: 'https://www.kabum.com.br/busca/crucial-ddr5-16gb-5600', store: 'kabum', category: 'ram1x16', name: 'Crucial DDR5 16GB 5600MHz (1x16)', target_price: 300 },
  { url: 'https://www.pichau.com.br/search?q=crucial+ddr5+16gb', store: 'pichau', category: 'ram1x16', name: 'Crucial DDR5 16GB 5600MHz (1x16)', target_price: 300 },

  // --- Módulo Individual em Amazon/ML ---
  { url: 'https://lista.mercadolivre.com.br/memoria-ddr5-16gb-5600', store: 'mercadolivre', category: 'ram1x16', name: 'DDR5 16GB 5600MHz (1x16) (ML)', target_price: 300 },

  // ═══════════════════════════════════════════════════
  // 🚀 MAX COVERAGE: CPUs Extras (Ryzen 9000 e Ryzen 7 série 7000X)
  // ═══════════════════════════════════════════════════

  // --- Ryzen 5 9600X (Next Gen) ---
  { url: 'https://www.kabum.com.br/busca/ryzen-5-9600x', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 5 9600X', target_price: 1500 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+5+9600x', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 5 9600X', target_price: 1500 },
  { url: 'https://www.terabyteshop.com.br/busca?str=ryzen+5+9600x', store: 'terabyte', category: 'cpu', name: 'AMD Ryzen 5 9600X', target_price: 1500 },

  // --- Ryzen 7 9700X (Next Gen 8-core) ---
  { url: 'https://www.kabum.com.br/busca/ryzen-7-9700x', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 7 9700X', target_price: 1900 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+7+9700x', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 7 9700X', target_price: 1900 },

  // --- Ryzen 7 7700X (Sweet spot para jogos/produtividade) ---
  { url: 'https://www.kabum.com.br/busca/ryzen-7-7700x', store: 'kabum', category: 'cpu', name: 'AMD Ryzen 7 7700X', target_price: 1700 },
  { url: 'https://www.pichau.com.br/search?q=ryzen+7+7700x', store: 'pichau', category: 'cpu', name: 'AMD Ryzen 7 7700X', target_price: 1700 },

  // ═══════════════════════════════════════════════════
  // 🚀 MAX COVERAGE: GPUs Stretch Goals (RX 6750 XT, 7800 XT, RTX 4070)
  // ═══════════════════════════════════════════════════

  // --- RX 6750 XT 12GB (O melhor custo/benefício absoluto se achar barato) ---
  { url: 'https://www.kabum.com.br/busca/rx-6750-xt', store: 'kabum', category: 'gpu', name: 'AMD Radeon RX 6750 XT 12GB', target_price: 1950 },
  { url: 'https://www.pichau.com.br/search?q=rx+6750+xt', store: 'pichau', category: 'gpu', name: 'AMD Radeon RX 6750 XT 12GB', target_price: 1950 },
  { url: 'https://www.terabyteshop.com.br/busca?str=rx+6750+xt', store: 'terabyte', category: 'gpu', name: 'AMD Radeon RX 6750 XT 12GB', target_price: 1950 },

  // --- RX 7800 XT 16GB (A Rainha do 1440p AM5) ---
  { url: 'https://www.kabum.com.br/busca/rx-7800-xt', store: 'kabum', category: 'gpu', name: 'AMD Radeon RX 7800 XT 16GB', target_price: 3300 },
  { url: 'https://www.pichau.com.br/search?q=rx+7800+xt', store: 'pichau', category: 'gpu', name: 'AMD Radeon RX 7800 XT 16GB', target_price: 3300 },
  { url: 'https://www.terabyteshop.com.br/busca?str=rx+7800+xt', store: 'terabyte', category: 'gpu', name: 'AMD Radeon RX 7800 XT 16GB', target_price: 3300 },

  // --- RTX 4070 12GB (Alternativa NVIDIA High-end) ---
  { url: 'https://www.kabum.com.br/busca/rtx-4070', store: 'kabum', category: 'gpu', name: 'NVIDIA GeForce RTX 4070 12GB / Super', target_price: 3600 },
  { url: 'https://www.pichau.com.br/search?q=rtx+4070', store: 'pichau', category: 'gpu', name: 'NVIDIA GeForce RTX 4070 12GB / Super', target_price: 3600 },
  { url: 'https://www.terabyteshop.com.br/busca?str=rtx+4070', store: 'terabyte', category: 'gpu', name: 'NVIDIA GeForce RTX 4070 12GB / Super', target_price: 3600 },

  // ═══════════════════════════════════════════════════
  // 🚀 MAX COVERAGE: Placas-Mãe Budget B650 Extras
  // ═══════════════════════════════════════════════════

  // --- ASUS Prime B650M-K (A mais simples da placa AM5 da ASUS) ---
  { url: 'https://www.kabum.com.br/busca/asus-prime-b650m-k', store: 'kabum', category: 'motherboard', name: 'ASUS Prime B650M-K', target_price: 680 },
  { url: 'https://www.pichau.com.br/search?q=asus+prime+b650m-k', store: 'pichau', category: 'motherboard', name: 'ASUS Prime B650M-K', target_price: 680 },

  // --- Gigabyte B650M K (Versão budget da Gigabyte) ---
  { url: 'https://www.kabum.com.br/busca/b650m-k-gigabyte', store: 'kabum', category: 'motherboard', name: 'Gigabyte B650M K', target_price: 720 },
  { url: 'https://www.pichau.com.br/search?q=gigabyte+b650m-k', store: 'pichau', category: 'motherboard', name: 'Gigabyte B650M K', target_price: 720 },

  // --- MSI PRO B650M-P (Diferente da B650M-A, versão mais barata) ---
  { url: 'https://www.kabum.com.br/busca/msi-pro-b650m-p', store: 'kabum', category: 'motherboard', name: 'MSI PRO B650M-P', target_price: 690 },
  { url: 'https://www.pichau.com.br/search?q=msi+pro+b650m-p', store: 'pichau', category: 'motherboard', name: 'MSI PRO B650M-P', target_price: 690 },

  // --- ASRock B650M-HDV/M.2 (A melhor entry-level por revisores) ---
  { url: 'https://www.terabyteshop.com.br/busca?str=asrock+b650m-hdv', store: 'terabyte', category: 'motherboard', name: 'ASRock B650M-HDV/M.2', target_price: 700 },

  // ═══════════════════════════════════════════════════
  // 🚀 MAX COVERAGE: RAM DDR5 High-Frequency (6400+ MHz)
  // ═══════════════════════════════════════════════════

  // --- Patriot Viper Venom 32GB (2x16) 6400MHz ---
  { url: 'https://www.kabum.com.br/busca/patriot-viper-venom-ddr5-32gb-6400', store: 'kabum', category: 'ram2x16', name: 'Patriot Viper Venom DDR5 32GB (2x16) 6400MHz', target_price: 850 },
  { url: 'https://www.pichau.com.br/search?q=patriot+viper+venom+ddr5+32gb+6400', store: 'pichau', category: 'ram2x16', name: 'Patriot Viper Venom DDR5 32GB (2x16) 6400MHz', target_price: 850 },

  // --- Kingston Fury Renegade 32GB (2x16) 6400MHz ---
  { url: 'https://www.kabum.com.br/busca/kingston-fury-renegade-ddr5-32gb', store: 'kabum', category: 'ram2x16', name: 'Kingston Fury Renegade DDR5 32GB (2x16) 6400MHz', target_price: 950 },
  { url: 'https://www.pichau.com.br/search?q=fury+renegade+ddr5+32gb', store: 'pichau', category: 'ram2x16', name: 'Kingston Fury Renegade DDR5 32GB (2x16) 6400MHz', target_price: 950 },

  // ═══════════════════════════════════════════════════
  // 💺 Cadeiras (Escritório/Gamer - Alvo R$ 500)
  // ═══════════════════════════════════════════════════
  { url: 'https://www.kabum.com.br/busca/cadeira-gamer', store: 'kabum', category: 'chair', name: 'Cadeira Gamer (Kabum)', target_price: 500 },
  { url: 'https://www.pichau.com.br/search?q=cadeira+gamer', store: 'pichau', category: 'chair', name: 'Cadeira Gamer (Pichau)', target_price: 500 },
  { url: 'https://www.terabyteshop.com.br/busca?str=cadeira+gamer', store: 'terabyte', category: 'chair', name: 'Cadeira Gamer (Terabyte)', target_price: 500 },
  { url: 'https://www.amazon.com.br/s?k=cadeira+escritorio+ergonomica', store: 'amazon', category: 'chair', name: 'Cadeira Escritório (Amazon)', target_price: 500 },
  { url: 'https://lista.mercadolivre.com.br/cadeira-gamer-promocao', store: 'mercadolivre', category: 'chair', name: 'Cadeira Gamer (ML)', target_price: 500 },
];

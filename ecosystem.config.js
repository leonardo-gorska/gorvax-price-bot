module.exports = {
  apps: [{
    name: "gorvaxbot",
    script: "./dist/index.js",
    instances: 1, // Instância principal do bot
    autorestart: true,
    watch: false,
    max_memory_restart: "600M", // Restart se Puppeteer engolir muita RAM
    env: {
      NODE_ENV: "production",
    },
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "data/logs/err.log",
    out_file: "data/logs/out.log",
    merge_logs: true,
    time: true,
  }]
}

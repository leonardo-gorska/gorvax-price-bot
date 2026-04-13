import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { getDebugPath } from '../scrapers/base';

const inputPath = getDebugPath('pichau_debug.html');
if (!fs.existsSync(inputPath)) {
  console.error(`Arquivo não encontrado: ${inputPath}`);
  process.exit(1);
}
const html = fs.readFileSync(inputPath, 'utf8');
const $ = cheerio.load(html);

let output = '--- JSON-LD ENCONTRADOS ---\n';
$('script[type="application/ld+json"]').each((i, el) => {
  try {
    const data = JSON.parse($(el).html() || '');
    output += `\nScript #${i+1}:\n`;
    output += JSON.stringify(data, null, 2);
    output += '\n';
  } catch (e) {
    output += `Script #${i+1} falhou ao parsear.\n`;
  }
});

const outputPath = getDebugPath('debug_pichau_json_clean.log');
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Dados salvos em ${outputPath}`);

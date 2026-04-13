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

console.log('--- __NEXT_DATA__ ENCONTRADO ---');
const nextData = $('#__NEXT_DATA__').html();
if (nextData) {
  try {
    const data = JSON.parse(nextData);
    console.log('Link __NEXT_DATA__ encontrado!');
    const outputPath = getDebugPath('debug_pichau_next.log');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Salvo em ${outputPath}`);
  } catch (e) {
    console.log('Falha ao parsear __NEXT_DATA__');
  }
} else {
  console.log('__NEXT_DATA__ não encontrado.');
}

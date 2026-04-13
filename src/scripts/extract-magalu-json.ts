import fs from 'fs';
import { parseHtml, getDebugPath } from '../scrapers/base';

function extract() {
  const inputPath = getDebugPath('magalu_iphone.html');
  if (!fs.existsSync(inputPath)) {
    console.error(`Arquivo de entrada não encontrado: ${inputPath}`);
    return;
  }
  const html = fs.readFileSync(inputPath, 'utf8');
  const $ = parseHtml(html);
  const nextData = $('#__NEXT_DATA__').html();
  if (nextData) {
    const outputPath = getDebugPath('magalu_next_data.json');
    fs.writeFileSync(outputPath, nextData);
    console.log(`__NEXT_DATA__ extraído com sucesso para ${outputPath}`);
  } else {
    console.error('__NEXT_DATA__ não encontrado no HTML');
  }
}

extract();

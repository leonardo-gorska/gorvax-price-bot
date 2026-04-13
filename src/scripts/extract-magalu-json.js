const fs = require('fs');
const html = fs.readFileSync('c:/Users/Gorska/Desktop/Chat Bot Promo/data/logs/debug/magalu_debug.html', 'utf8');
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
if (match) {
  const data = JSON.parse(match[1]);
  fs.writeFileSync('c:/Users/Gorska/Desktop/Chat Bot Promo/data/logs/debug/magalu_next_data.json', JSON.stringify(data, null, 2));
  console.log('JSON extraído com sucesso!');
} else {
  console.log('__NEXT_DATA__ não encontrado');
}

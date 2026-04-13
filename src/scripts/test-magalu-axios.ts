import axios from 'axios';
import fs from 'fs';
import { getDebugPath } from '../scrapers/base';

async function testAxios() {
  const url = 'https://www.magazineluiza.com.br/console-playstation-5-825gb-2-controles-dualsense-branco/p/232470900/ga/ga72/';
  console.log(`Tentando Axios em: ${url}`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 10000
    });
    
    const fileName = getDebugPath('magalu_axios.html');
    fs.writeFileSync(fileName, response.data);
    console.log(`Sucesso! Status: ${response.status}. HTML salvo em ${fileName}`);
  } catch (err: any) {
    console.error(`Erro no Axios: ${err.message}`);
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      const errorFile = getDebugPath('magalu_axios_error.html');
      fs.writeFileSync(errorFile, err.response.data);
      console.log(`Erro HTML salvo em ${errorFile}`);
    }
  }
}

testAxios();

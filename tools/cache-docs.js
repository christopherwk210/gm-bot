import fs from 'node:fs';
import path from 'node:path';
import https from 'https';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const docsIndexURL = 'https://manual.yoyogames.com/whxdata/idata1.new.js';
const outputPath = path.join(__dirname, '../static/docs-index.json');

export function cacheDocs() {
  return new Promise(resolve => {
    https.get(docsIndexURL, res => {
      let data = '';
      res.on('data', d => data += d.toString());
      res.on('close', () => {
        const result = data.match(/(?<=var\s*index\s*=\s*)({[\s\S]*})(?=;)/g);
        // const cleanOutput = JSON.stringify(JSON.parse(result[0]), null, 2);
        fs.writeFileSync(outputPath, result[0], 'utf-8');
        resolve();
      });
    });
  });  
}

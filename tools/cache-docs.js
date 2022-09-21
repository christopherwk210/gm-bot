import fs from 'node:fs';
import path from 'node:path';
import https from 'https';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const docsIndexURL = 'https://manual.yoyogames.com/whxdata/idata1.new.js';
const outputPath = path.join(__dirname, '../static/docs-index.json');

export async function cacheDocs() {
  const indexContents = await asyncGet(docsIndexURL);
  const index = indexContents.match(/(?<=var\s*index\s*=\s*)({[\s\S]*})(?=;)/g);
  
  // const parsedIndex = JSON.parse(index[0]);
  // for (const key of parsedIndex.keys) {
  //   for (const topic of key.topics) {
  //     const html = await asyncGet('https://manual.yoyogames.com/' + topic.url);
  //   }
  // }

  fs.writeFileSync(outputPath, index[0], 'utf-8');
}

function asyncGet(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      let data = '';
      res.on('data', d => data += d.toString());
      res.on('error', () => resolve(null))
      res.on('close', () => resolve(data));
    });
  })
}

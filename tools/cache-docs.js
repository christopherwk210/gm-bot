import fs from 'node:fs';
import path from 'node:path';
import https from 'https';
import url from 'node:url';
import * as cheerio from 'cheerio';
import cliProgress from 'cli-progress';
import axios from 'axios';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const docsIndexURL = 'https://manual.yoyogames.com/whxdata/idata1.new.js';
const outputPath = path.join(__dirname, '../static/docs-index.json');

export async function cacheDocs() {
  const response = await axios.get(docsIndexURL);
  if (response.status !== 200) return console.error('Error fetching!');
  
  const indexContents = response.data;
  const index = indexContents.match(/(?<=var\s*index\s*=\s*)({[\s\S]*})(?=;)/g);
  
  const parsedIndex = JSON.parse(index[0]);
  const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

  let totalTopics = 0;
  let topicsDone = 0;
  let failedCount = 0;
  for (const key of parsedIndex.keys) {
    for (const topic of key.topics) {
      totalTopics++;
      asyncGet('https://manual.yoyogames.com/' + topic.url, html => {
        progressBar.increment();
        topicsDone++;

        if (html) {
          const $ = cheerio.load(html);
          const p = $('p').first();
          topic.blurb = p.text().replace('\n', ' ');

          const h4 = $('h4').toArray().find(element => $(element).text().toLowerCase().includes('syntax:'));
          if (h4 && h4.next && h4.next.next) {
            const syntax = $(h4.next.next).text().replace(';', '').trim();
            if (syntax.includes(topic.name)) {
              topic.syntax = syntax;
            }
          }
        } else {
          failedCount++;
        }

        if (topicsDone >= totalTopics) {
          fs.writeFileSync(outputPath, JSON.stringify(parsedIndex, null, 2), 'utf-8');
          progressBar.stop();
          process.exit();
        }
      });
    }
  }
  progressBar.start(totalTopics);
}

function asyncGet(url, callback) {
  const promise = new Promise(resolve => {
    const request = https.get(url, { timeout: 1000 * 5 }, res => {
      let data = '';
      res.on('data', d => data += d.toString());
      res.on('end', () => resolve(data));
      res.on('error', () => resolve(data));
      res.on('close', () => resolve(data));
    });

    request.on('error', () => resolve(''));
    request.on('timeout', () => resolve(''));
  });

  promise.then(html => {
    if (html) {
      callback(html);
    } else {
      asyncGet(url, callback);
    }
  })
}

cacheDocs();

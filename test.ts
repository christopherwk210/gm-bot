import * as http from 'http';
import { load } from 'cheerio';

function getTutorialsPage(): Promise<string|boolean> {
  let chunks = [];
  return new Promise(resolve => {
    http.get('http://blog.studiominiboss.com/pixelart', res => {
      res.setEncoding('utf8');
      res.on('data', data => chunks.push(data));
      res.on('end', () => resolve(chunks.join('')));
      res.on('error', err => resolve(false));
    }).end();
  });
}

(async () => {
  const site = await getTutorialsPage();

  if (!site) return;

  const $ = load(<string>site);

  let bodyText = $('body').text().replace('Reading text with a timer is a bit stressful, so I added still frames of this tutorial:', '');

  let gifs = $('img').filter((i, img) => !!~img.attribs['src'].indexOf('gif'));
  let titles = bodyText.match(/#[0-9]+( | )([^#])+/g);

  let srcs = gifs.toArray().map(img => img.attribs['src']);
  srcs.forEach(s => {
    console.log(s);
  });
})();

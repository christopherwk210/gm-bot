import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { parseDocs } from 'gm-docs-parser';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const outputPath = path.join(__dirname, '../static/docs-index.json');
const manualPath = path.join(__dirname, './manual');

if (!fs.existsSync(manualPath)) {
  fs.mkdirSync(manualPath);
}

parseDocs(manualPath).then(result => {
  if (result.success) {
    const docsIndex = JSON.stringify(result.docs, null, 2);
    fs.writeFileSync(outputPath, docsIndex);
  } else {
    console.error('Failed to cache docs:');
    console.error(result.error);
  }
});
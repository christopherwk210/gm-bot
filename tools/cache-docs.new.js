import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import { spawn } from 'child_process';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const outputPath = path.join(__dirname, '../static/docs-index.json');
const manualPath = path.join(__dirname, './manual');
const keywordsPath = path.join(manualPath, './ZeusDocs_keywords.json');
const gmlRefPath = path.join(manualPath, './Manual/contents/GameMaker_Language/GML_Reference');

console.log('Updating from git...');
if (fs.existsSync(manualPath)) {
  const gitProcess = spawn('git pull', { shell: true, stdio: 'inherit', cwd: manualPath });
  gitProcess.on('close', () => { parseDocs(); });
} else {
  const gitClone = 'git clone git@github.com:YoYoGames/GameMaker-Manual.git tools/manual';
  const gitProcess = spawn(gitClone, { shell: true, stdio: 'inherit' });
  gitProcess.on('close', () => { parseDocs(); });
}

async function parseDocs() {

}
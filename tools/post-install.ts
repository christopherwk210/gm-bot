import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { Project } from './tool.config';

// Async
const exists = util.promisify(fs.exists);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

// Load external messages
const banner = fs.readFileSync(path.join(Project.SOURCE_ROOT, 'shared/assets/text/banner.txt'), 'utf8');
const intro = fs.readFileSync(path.join(Project.SOURCE_ROOT, 'shared/assets/text/getting-started.txt'), 'utf8');

const giveAwayDataPath = path.join(__dirname, '../data/giveAwaysData.json');
const giveAwayDataContainerPath = path.dirname(giveAwayDataPath);

(async () => {
  // 'Touch' giveAwaysData.json to prevent missing file errors on first load
  let gaExists = await exists(giveAwayDataPath);

  if (!gaExists) {
    if (!await exists(giveAwayDataContainerPath)) await mkdir(giveAwayDataContainerPath);
    await writeFile(giveAwayDataPath, '{}', { encoding: 'utf8' });
  }

  // Clear the console
  console.log('\x1Bc');

  // Print the banner
  console.log(`${banner}\n`);

  // Print copyright information
  console.log(`unityBot v${require('../package.json').version}`);

  // Print getting started information
  console.log(`${intro}\n`);
})();

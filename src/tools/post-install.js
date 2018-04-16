// Node libs
let fs = require('fs');
let path = require('path');

// Load external messages
let banner = fs.readFileSync('./src/assets/text/banner.txt', 'utf8');
let intro = fs.readFileSync('./src/assets/text/getting-started.txt', 'utf8');

// 'Touch' giveAwaysData.json to prevent missing file errors on first load
try {
  fs.closeSync(fs.openSync(path.join(__dirname, '../data/giveAwaysData.json'), 'wx'));
} catch(e) {
  // Give away json already exists, no issue
}

// Clear the console
console.log('\x1Bc');

// Print the banner
console.log(`${banner}\n`);

// Print copyright information
console.log('GameMakerBot v' + require('../../package.json').version);
console.log('Copyright © 2018 Chris "topherlicious" Anselmo & Contributors\nThis program comes with ABSOLUTELY NO WARRANTY.\n');

// Print getting started information
console.log(`${intro}\n`);

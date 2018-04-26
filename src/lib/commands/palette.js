// Node libs
const Discord = require('discord.js');
const https = require('https');
// Keywords list
const keywords = require('./palette.keywords.js');

/**
 * Sends a palette link along with an image of the pallete
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
 */
module.exports = function(msg, args) {
  // Remove the command "!palette" from the args array
  args.shift(-1);

  // Exit if the user has not provided a palette name
  if (args.length < 1) {
    let rnd = ((Math.random() < 1 / 16) && ', ya dingus') || '';
    msg.channel.send(`Invalid command usage${rnd}! Proper usage: \`\`.palette [palette_name]\`\``);
    msg.delete().catch(() => {});
    return;
  }

  // Find name of palette, spaces changed to dashes, for link purposes. Lowercased.
  let paletteName = matchKeyword(args.reduce((acc, val) => `${acc}-${val}`)).toLowerCase();

  // Create the embed
  let embed = new Discord.RichEmbed()
    .setTitle('Palette Not Found')
    .setURL(`https://lospec.com/palette-list/${paletteName}`)
    .setImage(`https://lospec.com/palette-list/${paletteName}-32x.png`);

  let str = '';
  // Get the wepage to check if the palette exists
  https.get(`https://lospec.com/palette-list/${paletteName}`, (res) => {
    res.on('data', (chunk) => { str += chunk.toString(); });

    res.on('end', () => {

      // Create a regex to find the <title>title</title>
      let match = str.match(/(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi);

      if (match) {
        let out = match[0];
        // Slice off the <title> tags, to just get the title
        let pretaglen = out.match(/<\s*title[^>]*>/)[0].length;
        let endtaglen = out.slice(pretaglen).match(/<\s*\/\s*title>/)[0].length;
        let title     = out.slice(pretaglen, -endtaglen);

        // Check if the title uses hexadecimal html Codes
        let htmlChars = title.match(/&#x[0-9a-fA-F]+;/gi);
        // Loop through all the html codes
        while (htmlChars && htmlChars.length > 0) {
          let htmlChar = htmlChars.shift();
          // Convert the hexadecimal to ASCII
          let char = hex2ascii(htmlChar.match(/[0-9a-fA-F]+/)[0]);
          // Swap out the &#xXX; garbage with nice, readable ASCII characters
          let before = title.slice(0, title.indexOf(htmlChar));
          title = before + char + title.slice(before.length + htmlChar.length, title.length);
        }

        // update title of embed, send embed, delete command message
        embed.setTitle(title);
        msg.channel.send({ embed });
        msg.delete().catch(() => {});

      }
    });
  }).on('error', (err) => {
    // Oh god. Oh man. This should not happen.
    console.log(`Error getting lospec page (palette.js): ${err.message}`);
    // Send the embed anyway. It should say "Palette Not Found"
    msg.channel.send({ embed });
    msg.delete().catch(() => {});
  });
};

/**
 * Converts hexadecimal string to ASCII string
 * @param {String} hexx String containing hexadecimal values
*/
function hex2ascii(hexx) {
  let hex = hexx.toString();
  let str = '';
  for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

/**
 * Matches keywords/abbreviations/typos, and returns lospec-friendly palette names
 * @param {String} str String
*/
function matchKeyword(rawStr) {
  // Remove unwanted characters from the string
  let str = rawStr.replace(/['":/*&^%$#@!+=;|?~(){}\[\]\\><`]/g, '').toLowerCase();
  // Check if a string ends with one or more numbers, but does not have a
  // space (or dash, in this case) in front of it.
  // If it does, add a space (dash) between the text and the number.
  let match;
  match = str.match('[^-0-9]+[0-9]+$');
  if (match) {
    // Get the matched string, and it's length
    let substr = match[0];
    let sublen = match[0].length;
    // Find the position to insert the space (dash) at, relative to the matched substring
    let inspos = substr.match('[^0-9]+[0-9]')[0].length - 1;
    // Find the position we want to insert at in the main string
    let pos = (str.length - sublen) + inspos;
    // Insert a dash between the text and the last number
    str = [str.slice(0, pos), '-', str.slice(pos)].join('');
  }

  // Replace common abbreviations/typos/keywords with their full name / whatever name they use at lospec.
  for (let keyword of keywords) {
    match = str.match(keyword.match);
    if (match) {
      let val = keyword.value;
      // Apply optional keyword action
      if (keyword.hasOwnProperty('action')) {
        let out = keyword.action(str, match);
        // Check if action failed
        if (out === null) {
          console.log(`Error performing keyword action for "${str}" in palette.js`);
          return str;
        }
        // Concatinate action output to end of string
        if (out !== undefined) val += out;
      }
      // Return value associated with matched keyword
      return val;
    }
  }
  // If no abbreviations / changes were found, return the string and hope for the best!
  return str;
}

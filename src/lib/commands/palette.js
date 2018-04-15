const Discord = require('discord.js');
const https = require('https');

/**
 * Sends a palette link along with an image of the pallete
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
*/
module.exports = function(msg, args) {
    // Remove the command "!palette" from the args array
    args.shift(-1);

    if (args.length < 1) {
      let rnd = '';
      if (Math.random() < 1 / 16) rnd = ', ya dingus';
      msg.delete().catch(() => {});
      msg.channel.send('Invalid command usage' + rnd + '! Proper usage: ``!palette [palette_name]``');
      return;
    }

    // Find name of palette, spaces changed to dashes, for link purposes. Lowercased.
    let paletteName = unabbreviate(args.reduce((acc, val) => acc + '-' + val)).toLowerCase();

    // Create the embed
    let embed = new Discord.RichEmbed()
      .setTitle('Palette Not Found')
      .setURL('https://lospec.com/palette-list/' + paletteName)
      .setImage('https://lospec.com/palette-list/' + paletteName + '-32x.png');

    // Get the wepage to check if the palette exists
    https.get('https://lospec.com/palette-list/' + paletteName, (res) => {
      res.on('data', function (chunk) {
        // Turn the data into a string
        let str = chunk.toString();

        // Create a regex to find the <title>
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
            console.log('hex: ' + htmlChar.match(/[0-9a-fA-F]+/)[0] + ', ASCII: ' + char);

            // Insert swap out the &#xXX; garbage with nice, readable ASCII characters
            let before = title.slice(0, title.indexOf(htmlChar));
            title = before + char + title.slice(before.length + htmlChar.length, title.length);
          }

          // update title of embed, send embed, delete command message
          embed.setTitle(title)
          msg.channel.send({embed});
          msg.delete().catch(() => {});
        }
      });
    }).on('error', (err) => {
      // Oh god. Oh man. This should not happen.
      console.log('Error getting lospec page (palette.js): ' + err.message);

      // Send the embed anyway. It should say "Palette Not Found"
      msg.channel.send({embed});
      msg.delete().catch(() => {});
    });
}

/**
 * Converts hexadecimal string to ASCII string
 * @param {String} hexx String containing hexadecimal values
 */
function hex2ascii(hexx) {
  let hex = hexx.toString();
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

/**
 * Unabbreviates names that may cause errors for the palette command
 * @param {String} str String
*/
function unabbreviate(str) {
  // Remove unwanted characters from the string
  str = str.replace(/['":/*&^%$#@!+=;|?~(){}\[\]\\><`]/g, '');

  // Check if a string ends with one or more numbers, but does not have a
  // space (or dash, in this case) in front of it.
  // If it does, add a space (dash) between the text and the number.
  let match = str.match('[^-0-9]+[0-9]+$');
  if (match || false) {
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
  
  // Store modified capitalized string, make the other lowercase.
  let oldStr = str;
  str = str.toLowerCase();

  // Replace common abbrevations/typos with their full name / whatever name they use at lospec.
  switch (str) {
    case (str.match(/^en?d(es)?ga?-*[0-9]+-*x?$/) || false).input:
      return 'Endesga-' + str.match('[0-9]+')[0];
    case (str.match(/^dbs?-*8$/) || false).input:
      return 'DawnBringers-8-color';
    case 'aseprite-default': str += '32';
    case (str.match(/^d(awn)?-*b(ringer)?-*[0-9]+$/i) || false).input:
      return 'DawnBringer-' + str.slice(str.indexOf(str.match(/[0-9]+$/)[0]), str.length);
    case (str.match(/^andrew-*ken?sler-*[0-9]+$/) || false).input:
      return 'Andrew-Kensler-' + str.slice(str.indexOf(str.match(/[0-9]+$/)[0]), str.length);
    case 'apple-2':
      return 'Apple-II';
    case 'nes':
      return 'Nintendo-Entertainment-System';
    case 'jmp':
      return 'JMP-Japanese-Machine-Palette';
    default:
      // If no abbreviations / changes are found, return the string and hope for the best!
      return oldStr;
  }
}

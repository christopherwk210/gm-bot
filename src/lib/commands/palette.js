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
      if (Math.random() < 1/16) rnd = ', ya dingus';
      msg.delete().catch(() => {});
      msg.channel.send('Invalid command usage'+rnd+'! Proper usage: ``.palette [palette_name]``');
      return;
    }

    // Find name of palette, spaces changed to dashes, for link purposes. Lowercased.
    let paletteName = unabbreviate(args.reduce((acc, val) => acc + '-' + val)).toLowerCase();

    // Create the embed
    let embed = new Discord.RichEmbed()
      .setTitle('Palette Not Found')
      .setURL('https://lospec.com/palette-list/' + paletteName)
      .setImage('https://lospec.com/palette-list/' + paletteName + '-32x.png')

    // Get the wepage to check if the palette exists
    https.get('https://lospec.com/palette-list/' + paletteName, (res) => {
      res.on('data', function (chunk) {

        // Turn the data into a string
        let str = chunk.toString();

        // Create a regex to find the <title>
        var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
        let out = str.match(re);

        if (out) {
          // slice off the <title> tags, to just get the title
          // WARNING: I am using magic numbers here because no one
          // puts anything into the title tag, but it might be smart
          // to re-do this bit to something less hacky
          let title = out[0].slice(7, -8);

          // update title of embed, send embed, delete command message
          embed.setTitle(title)
          msg.channel.send({embed});
          msg.delete().catch(() => {});

          return;
        }
      });
    }).on("error", (err) => {

      // Oh god. Oh man. This should not happen.
      console.log("Error getting lospec page (palette.js): " + err.message);

      // Send the embed anyway. It should say "Palette Not Found"
      msg.channel.send({embed});
      msg.delete().catch(() => {});

      return;
    });
}


/**
 * Unabbreviates names that may cause errors for the palette command
 * @param {String} str String
*/
unabbreviate = function(str) {

    // Remove unwanted characters from the string
    str = str.replace(/['":/*&^%$#@!+=;|?~(){}\[\]\\><`]/g, '');

    // Check if a string ends with one or more numbers, but does not have a
    // space (or dash, in this case) in front of it.
    // If it does, add a space (dash) between the text and the number.
    let match = str.match(`[^-0-9]+[0-9]+$`);
    if (match || false) {

      // Get the matched string, and it's length
      let substr = match[0];
      let sublen = match[0].length;

      // Find the position to insert the space (dash) at, relative to the matched substring
      let inspos = substr.match(`[^0-9]+[0-9]`)[0].length - 1;
      
      // Find the position we want to insert at in the main string
      var pos = (str.length - sublen) + inspos;

      // Insert a dash between the text and the last number
      str = [str.slice(0, pos), '-', str.slice(pos)].join('');
    }

    // Replace common abbrevations/typos with their full name / whatever name
    // they use at lospec.
    switch (str) {
      case 'aseprite-default': str += '32';
      case (str.match(`dawn-?bringer-?[0-9]+`) || false).input:
      case (str.match(`db-?[0-9]+`) || false).input:
        return 'DawnBringer-' + str.slice(str.length-2, str.length);
        break;
      case 'nes':
        return 'Nintendo-Entertainment-System';
        break;
      case 'jmp':
        return 'JMP-Japanese-Machine-Palette';
        break;
      default:
        return str; break;
    }
}

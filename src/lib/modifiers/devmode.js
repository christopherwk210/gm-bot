/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const rules = require('../rules.js');
const giveAways = require('../utils/giveAwayLib.js');
const devModeExp = new RegExp(/([`]{3})!devmode([^```]*)([`]{3})/g);

module.exports = function(msg, bot) {
  if (!msg.member) return false;

  // Only topherlicious can use this feature!
  if (msg.member.id !== '144913457429348352') {
    return false;
  }

  if (devModeExp.test(msg.content)) {
    // Fetch the code block contents
    let code = msg.content.match(devModeExp);

    // Get just the code
    let rawCode = code[0].substr(11,code[0].length - 14);

    // Create helper functions
    // eslint-disable-next-line func-style
    let reply = function(str) {
      msg.channel.send(str);
    };

    // Execute code
    // eslint-disable-next-line no-eval
    eval(rawCode);

    return true;
  } else {
    return false;
  }
};
/* eslint-enable no-unused-vars */

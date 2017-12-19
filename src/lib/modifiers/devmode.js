const rules = require('../rules.js');
const giveAways = require('../utils/giveAwayLib.js');
const devModeExp = new RegExp(/([`]{3})!devmode([^```]*)([`]{3})/g);

module.exports = function(msg) {
  // Only topherlicious can use this feature!
  if (msg.member.id !== '144913457429348352') {
    return false;
  }

  if (devModeExp.test(msg.content)) {
    // Fetch the code block contents
    var code = msg.content.match(devModeExp);

    // Get just the code
    var rawCode = code[0].substr(11,code[0].length - 14);

    // Create helper functions
    reply = str => {
      msg.channel.send(str);
    };

    // Execute code
    eval(rawCode);

    return true;
  } else {
    return false;
  }
};

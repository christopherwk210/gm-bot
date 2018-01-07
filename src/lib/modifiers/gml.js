const gmlexec = require('../utils/gmlexec.js');
const gmlExp = new RegExp(/([`]{3})gml([^```]*)([`]{3})/g);
const Discord = require('discord.js');

module.exports = function(msg) {
  if (!msg.member) return false;

  // Only topherlicious can use this feature!
  if (msg.member.id !== '144913457429348352') {
    return false;
  }

  if (gmlExp.test(msg.content)) {
    // Fetch the code block contents
    var code = msg.content.match(gmlExp);

    // Get just the code
    var rawCode = code[0].substr(6,code[0].length - 9);

    // Execute GML
    gmlexec(rawCode, (err, data) => {
      if (err) {
        console.log(err);
        msg.channel.send(err);
      } else {
        console.log(data);

        let returnMessageEmbed = new Discord.RichEmbed({
          color: 26659,
          description: 'GML execution complete.\n\n**Trace Log:**\n```',
          timestamp: new Date(),
          footer: {
            text: 'Powered by GMLive.'
          }
        });

        data.trace.forEach(entry => {
          returnMessageEmbed.description += entry + '\n';
        });

        msg.channel.send(returnMessageEmbed);
      }
    });

    return true;
  } else {
    return false;
  }
};

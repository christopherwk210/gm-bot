const gmlexec = require('../utils/gmlexec.js');
const gmlExp = new RegExp(/([`]{3})gml([^```]*)([`]{3})/g);

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
        let returnString = '**Trace Log:**\n```';

        data.trace.forEach(entry => {
          returnString += entry + '\n';
        });

        msg.channel.send( returnString.substring(0, returnString.length - 1) + '```' );
      }
    });

    return true;
  } else {
    return false;
  }
};

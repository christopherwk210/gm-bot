const gmlexec = require('../utils/gmlexec.js');
const detectStaff = require('../utils/detectStaff');
const gmlExp = new RegExp(/(`{3})gml((?:[^`]+|`{1,2}[^`])*)(`{3})/g);

export function gml(msg) {
  if (!msg.member) {
    return false;
  }

  // Only staff can use this feature
  if (!detectStaff(msg.member)) {
    return false;
  }

  if (gmlExp.test(msg.content)) {
    // Fetch the code block contents
    let code = msg.content.match(gmlExp);

    // Get just the code
    let rawCode = code[0].substr(6,code[0].length - 9);

    // Execute GML
    gmlexec(rawCode, (err, data) => {
      if (err) {
        console.log(err);
        msg.channel.send(err);
      } else {
        console.log(data);
        
        let returnString = 'GML execution complete.\n\n**Trace Log:**\n```';

        data.trace.forEach(entry => {
          returnString += `${entry}\n`;
        });

        msg.channel.send( `${returnString.substring(0, returnString.length - 1)}\`\`\` \n Powered by GMLive.` );
      }
    });

    return true;
  } else {
    return false;
  }
};

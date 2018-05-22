const beautify = require('js-beautify').js_beautify;
const cleanCodeExp = new RegExp(/([`]{3})clean-code([^```]*)([`]{3})/g);
const beautifyOptions = require('../../assets/json/jsbeautify.json');

export function prettifier(msg) {
  // Test for the correct code block
  if (cleanCodeExp.test(msg.content)) {
    // Delete the old message
    msg.delete().catch(() => {});

    // Set up a response string
    let res = `${msg.author}, here is your message with formatted code:\n${msg.content}`;

    // Fetch the code block contents
    let code = msg.content.match(cleanCodeExp);

    let prettyCode;

    // Loop through the matches
    for (let i = 0; i < code.length; i++) {
      // Replace all code with pretty code
      let originalCode = code[i].substr(13,code[i].length - 16);
      prettyCode = beautify(originalCode, beautifyOptions);
      res = res.replace(originalCode, prettyCode);
    }

    // Replace the language with javascript
    res = res.replace(/(clean-code)/g, 'javascript\n');

    // Send it to the channel!
    msg.channel.send(res).catch(() => {});

    return prettyCode;
  } else {
    return false;
  }
};

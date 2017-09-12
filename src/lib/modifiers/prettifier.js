const Beautify = require('js-beautify').js_beautify;
const cleanCodeExp = new RegExp(/([`]{3})clean-code([^```]*)([`]{3})/g);
const beautifyOptions = require("../assets/json/jsbeautify.json");

const clean = function(msg) {
  // Test for the correct code block
  if (cleanCodeExp.test(msg.content)) {
    // Delete the old message
    msg.delete()
      .then(msg => console.log(`Deleted message from ${msg.author}`))
      .catch(console.error);

    // Set up a response string
    var res = msg.author + `, here is your message with formatted code:\n${msg.content}`;

    // Fetch the code block contents
    var code = msg.content.match(cleanCodeExp);

    // Loop through the matches
    for (var i = 0; i < code.length; i++) {
      // Replace all code with pretty code
      var originalCode = code[i].substr(13,code[i].length - 16);
      var prettyCode = Beautify(originalCode, beautifyOptions);
      res = res.replace(originalCode, prettyCode);
    }

    // Replace the language with javascript
    res = res.replace(/(clean-code)/g, 'javascript\n');

    // Send it to the channel!
    msg.channel.sendMessage(res)
      .then(msg => console.log(`Sent message: ${msg.content}`))
      .catch(console.error);

    return true;
  } else {
    return false;
  }
};

module.exports.clean = clean;

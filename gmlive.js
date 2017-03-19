const gmliveExp = new RegExp(/([`]{3})gmlive([^```]*)([`]{3})/g);

const parse = function(msg) {
  if (gmliveExp.test(msg.content)) {

      // Delete the old message
      msg.delete()
          .then(msg => console.log(`Deleted message from ${msg.author}`))
          .catch(console.error);

      // Fetch the code block contents
      var code = msg.content.match(gmliveExp);

      // Get just the code
      var rawCode = code[0].substr(9,code[i].length - 12);

      // Make a gmlive link
      var url = `http://yal.cc/r/gml/?mode=2D&gml=${base64_encode(rawCode)}`;

      // Make a message
      var res = `${msg.author} Here's a GMLive link: ${url}`;

      // Send it to the channel!
      msg.channel.sendMessage(res)
          .then(msg => console.log(`Sent message: ${msg.content}`))
          .catch(console.error);
  }
};

module.exports.parse = parse;

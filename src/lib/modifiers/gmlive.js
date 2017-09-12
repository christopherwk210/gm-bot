const gmliveExp = new RegExp(/([`]{3})gmlive([^```]*)([`]{3})/g);

module.exports = function(msg) {
  if (gmliveExp.test(msg.content)) {
    // Delete the old message
    msg.delete()
        .then(msg => console.log(`Deleted message from ${msg.author}`))
        .catch(console.error);

    // Fetch the code block contents
    var code = msg.content.match(gmliveExp);

    // Get just the code
    var rawCode = code[0].substr(9,code[0].length - 12);
    // Make a gmlive link
    var url = `http://yal.cc/r/gml/?mode=2d&gml=${Buffer.from(rawCode).toString('base64')}`;

    // Make a message
    var res = `${msg.author} Here's your GMLive link:\n ${url}\nTo run the snippet click the link and press "Run".`;

    // Send it to the channel!
    msg.channel.send(res)
        .then(msg => console.log(`Sent message: ${msg.content}`))
        .catch(console.error);

    return true;
  } else {
    return false;
  }
};
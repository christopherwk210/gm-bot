const http = require('http');
const hasteExp = new RegExp(/([`]{3})haste([^```]*)([`]{3})/g);

module.exports = function(msg) {
  if (hasteExp.test(msg.content)) {

    // Fetch the code
    let code = msg.content.match(hasteExp);

    // Delete the old message
    // msg.delete().catch(() => {});

    // Fetch author of message
    let user = msg.author.username; // Fetch user's name

    // Create HTTP options
    let postOptions = {
      host: 'haste.gmcloud.org',
      path: '/documents',
      port: '80',
      method: 'POST'
    };

    // Configure request
    let postRequest = http.request(postOptions, res => {
      // Encode to UTF8
      res.setEncoding('utf8');

      // Create a callback to retrieve url
      res.on('data', response => {
        // Parse the response for the key
        let key = JSON.parse(response).key;
        msg.channel.send(`Here's your GML hastebin link, ${user}\nhttp://haste.gmcloud.org/${key}.gml`); // Post the hastebin link
      })
    });

    // Sending Requestt
    postRequest.write(code);
    postRequest.end();
  }
};

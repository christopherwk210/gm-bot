import { Message } from 'discord.js';

import * as http from 'http';
const hasteExp = new RegExp(/([`]{3})haste([^```]*)([`]{3})/g);

export function haste(msg: Message) {
  if (hasteExp.test(msg.content)) {

    // Fetch the code block contents
    let code = msg.content.match(hasteExp);

    // Get just the code
    let rawCode = code[0].substr(9, code[0].length - 12)

    // Delete the old message
    msg.delete().catch(() => {});

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
      res.on('data', (response: string) => {
        // Parse the response for the key
        let key = JSON.parse(response).key;
        msg.channel.send(`Here's your GML hastebin link, ${msg.author} \nhttp://haste.gmcloud.org/${key}.gml`); // Post the hastebin link
      })
    });

    // Sending Requestt
    postRequest.write(rawCode);
    postRequest.end();
  }
};

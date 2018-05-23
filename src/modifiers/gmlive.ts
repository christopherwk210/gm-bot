import { Message } from "discord.js";

const gmliveExp = new RegExp(/([`]{3})gmlive([^```]*)([`]{3})/g);

export function gmlive(msg: Message) {
  if (gmliveExp.test(msg.content)) {
    // Delete the old message
    msg.delete().catch(() => {});

    // Fetch the code block contents
    let code = msg.content.match(gmliveExp);

    // Get just the code
    let rawCode = code[0].substr(9,code[0].length - 12);
    // Make a gmlive link
    let url = `http://yal.cc/r/gml/?mode=2d&gml=${Buffer.from(rawCode).toString('base64')}`;

    // Make a message
    let res = `${msg.author} Here's your GMLive link:\n ${url}\nTo run the snippet click the link and press "Run".`;

    // Send it to the channel!
    msg.channel.send(res).catch(() => {});

    return url;
  } else {
    return false;
  }
};

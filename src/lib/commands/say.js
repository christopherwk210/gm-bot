const Discord = require('discord.js');

/**
 * Allows you to speak on the bot's behalf
 * @param {*} msg 
 * @param {Array<string>} args 
 */
module.exports = function(msg, args) {
  let regex = /"([\s\S]*)"/g;
  let fancy = args.indexOf('-f') !== -1;

  // Catch message
  let match = msg.content.match(regex);

  // Err on no match
  if (!match || match.length < 1) {
    return;
  }

  // Get only the first match (there will only be one)
  let message = msg.content.match(regex)[0];

  // Trim " chars
  message = message.slice(1, message.length - 1);

  // Make sure there's a message to send
  if (message.length === 0) {
    return;
  }

  // Create a rich embed
  if (fancy) {
    fancy = new Discord.RichEmbed({
      author: {
        name: 'GameMakerBot',
        icon_url: 'https://cdn.discordapp.com/app-icons/295327000372051968/a073c2f3f8904916d98d873b90517665.png',
        url: 'https://bitbucket.org/christopherwk210/gm-bot'
      },
      color: 26659,
      timestamp: new Date(),
      description: message
    });
  }

  // Check if channels were mentioned
  if (msg.mentions.channels.size > 0) {

    // For each channel mentioned
    msg.mentions.channels.forEach(channel => {
      // Send the message
      fancy ? channel.send(fancy) : channel.send(message);
    });
  } else {
    // Send message to same channel
    fancy ? msg.channel.send(fancy) : msg.channel.send(message);
  }
}

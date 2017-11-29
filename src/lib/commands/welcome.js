// Discord
const Discord = require('discord.js');

// Node libs
const fs = require('fs');

// Project data
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');

// Create the embed
let messageEmbed = new Discord.RichEmbed({
  color: 26659,
  description: welcome,
  timestamp: new Date(),
  footer: {
    text: 'This is an automated message'
  }
});

/**
 * Send the welcome message!
 * @param {User} member Discord user
 */
module.exports = function(member) {
  member.send(messageEmbed).catch(() => {});
};

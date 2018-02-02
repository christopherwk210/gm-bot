// Node libs
const Discord = require('discord.js');
const detectStaff = require('../utils/detectStaff.js');

let currentPixelChallenge = {
  entries: []
};

/**
 * Handles pixel challenge entries
 */
function pixelChallenge(msg, args) {

  if (!msg.member) {
    msg.channel.send('You can only do that in the /r/GameMaker Discord Server, you silly!');
    return;
  }

  if (detectStaff(msg.member)) {
    if (args.length > 2 && args[1] === '-list') {
      msg.author.send('Here are the current pixel challenge entries:').then(m => {
        currentPixelChallenge.entries.forEach(entry => {
          msg.author.send(`**User:** ${entry.name}, **Entry:** ${entry.link}`);
        });
      });
      return;
    } else if (args.length > 2 && args[1] === '-clear') {
      msg.author.send('The entries have been cleared! Here are entries you cleared, one last time:').then(m => {
        currentPixelChallenge.entries.forEach(entry => {
          msg.author.send(`**User:** ${entry.name}, **Entry:** ${entry.link}`);
        });
      });
      return;
    }
  }

  // Get all message attachments
  let attachments = Array.from(msg.attachments.values());

  // Ensure an attachment exists
  if (!attachments.length) {
    msg.channel.send('Invalid command usage! You must upload an image with your message when using the pixel challenge command.');
    return;
  }

  let found = false;

  // Check if this user already has an entry
  currentPixelChallenge.entries.forEach(entry => {
    if (entry.name === msg.author.username) {
      found = true;
      
      // Take first image
      entry.link = attachments[0].url;

      msg.channel.send(`Updated existing entry for ${msg.author.username}.`);
    }
  });

  // Append if not found
  if (!found) {
    currentPixelChallenge.entries.push({
      name: msg.author.username,
      link: attachments[0].url
    });

    msg.channel.send(`Challenge entry for ${msg.author.username} recorded.`);
  }
}

module.exports = pixelChallenge;

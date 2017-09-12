// Imports
const fs = require("fs");
const resources = fs.readFileSync('./src/assets/markdown/resources.md', 'utf8');

/**
 * Will send resources to a user or given user if being sent by an admin or rubber duck
 * @param {Message} msg Discord msg
 * @param {Array<string>} args Command args
 */
module.exports = function(msg, args) {
  // If the author is an admin or duck
  if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins') || msg.member.roles.find('name', 'rubber duckies')) {
    // If they have supplied an argument
    if (args[1]) {
      // And it's a valid member of the server
      let id = args[1].replace(/([<>@])/g, '');
      let user = msg.member.guild.members.get(id);
      if (user) {
        // Send them resources!
        user.sendMessage(resources);
      } else {
        // Whoops, no member found
        msg.author.sendMessage('An error occurred with your request... Did you mention a valid user?');
      }
    } else {
      // We don't want to send it to another user, send it to us
      msg.author.sendMessage(resources);
    }
  } else {
    // We can only mean ourselves!
    msg.author.sendMessage(resources);
  }
};
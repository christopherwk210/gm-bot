import { Message } from 'discord.js';
import { markdownService } from '../services/markdown.service';

// Node libs
import fs = require('fs');

// Project data
const resources = markdownService.files['resources'];

// Project utils
import { detectStaff } from '../utils/detectStaff';

/**
 * Will send resources to a user or given user if being sent by an admin or rubber duck
 * @param msg Discord msg
 * @param args Command args
 */
module.exports = function(msg: Message, args: string[]) {
  // If the author is an admin or duck
  if (detectStaff(msg.member)) {
    // If they have supplied an argument
    if (args[1]) {
      // And it's a valid member of the server
      let id = args[1].replace(/([<>@])/g, '');
      let user = msg.member.guild.members.get(id);
      if (user) {
        // Send them resources!
        user.send(resources);
      } else {
        // Whoops, no member found
        msg.author.send('An error occurred with your request... Did you mention a valid user?');
      }
    } else {
      // We don't want to send it to another user, send it to us
      msg.author.send(resources);
    }
  } else {
    // We can only mean ourselves!
    msg.author.send(resources);
  }
};

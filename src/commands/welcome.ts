import { GuildMember } from 'discord.js';
import { markdownService } from '../services/markdown.service';

// Discord
const Discord = require('discord.js');

// Node libs
import fs = require('fs');

// Project data
const welcome = markdownService.files['welcome'];

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
export = function(member: GuildMember) {
  member.send(messageEmbed).catch(() => {});
};

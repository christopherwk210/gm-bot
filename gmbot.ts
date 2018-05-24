/**
 * GameMakerBot!
 * Chris "Topher" Anselmo <christopherwk210@gmail.com> & contributors.
 * MIT License
 */

// Init discord api
import { Message, Client, GuildMember } from 'discord.js';
const bot = new Client();

// Project libs
import rules = require('./src/rules');

// Modifiers
import { prettifier } from './src/modifiers/prettifier';
import { gmlive } from './src/modifiers/gmlive';
import { devmode } from './src/modifiers/devmode';
import { gml } from './src/modifiers/gml';
import { haste } from './src/modifiers/haste';

// Express
import express = require('./src/express/express');

// Utils
import { parseCommandList } from './src/shared/utils/parseCommandList';

// Commands
import welcome = require('./src/commands/welcome');

// Services
import { roleService } from './src/shared/services/role.service';
import { guildService } from './src/shared/services/guild.service';
import { channelService } from './src/shared/services/channel.service';
import { markdownService } from './src/shared/services/markdown.service';
import { textService } from './src/shared/services/text.service';
import { jsonService } from './src/shared/services/json.service';

// Image upload limitting
let imageOptions = {
  imageLog: {
    timers: []
  },
  imageCap: 3,              // 3 images within
  imageTimer: 1000 * 60 * 5 // 5 minutes
};

// Initialize file based services
markdownService.loadAllMarkdownFiles();
textService.loadAllTextFiles();
jsonService.loadAlljsonFiles();

// Auth token
let auth = jsonService.files['auth'];

// Bad links
const badlinks = jsonService.files['bad-links'];

// Well shit, ya didn't read the instructions did ya?
if (!auth) {
  console.log('No auth.json found. Please see README.md and ./shared/assets/auth.example.json.');
  process.exit();
}

// Bot callbacks
bot.on('ready', onBotReady);                        // Bot is loaded
bot.on('guildMemberAdd', welcome);                  // A new member has joined
bot.on('voiceStateUpdate', onBotVoiceStateUpdate);  // Voice activity change
bot.on('messageUpdate', onBotMessageUpdate);        // Message updated
bot.on('message', onBotMessage);                    // Message sent (in DM or in server channel)

/**
 * Called when the bot has reported ready status
 */
function onBotReady() {
  // Initialize services
  roleService.init(bot);
  guildService.init(bot);
  channelService.init(bot);

  // Tell the world our feelings
  console.log('Squaring to go, captain.');
}

/**
 * Called whenever a user changes voice state
 * @param oldMember The member before the voice state update
 * @param newMember The member after the voice state update
 */
function onBotVoiceStateUpdate(oldMember: GuildMember, newMember: GuildMember) {
  // Attempt to add voip_text role
  try {
    // Determine they are a member and in the voip channel
    if (
      newMember && newMember.voiceChannel &&
      (
        newMember.voiceChannel.id === '332567530025779200' || // Casual
        newMember.voiceChannel.id === '262834612932182026' || // Coworking
        newMember.voiceChannel.id === '295976186625130512'    // Playin a game
      )
    ) {
      // Fetch the proper roles
      let voipRole = roleService.getRoleByID('275366872189370369');          // 'voip' role
      let voiceActivityRole = roleService.getRoleByID('390434366125506560'); // 'voice activity' role
      let voipAlumniRole = roleService.getRoleByID('390563903085477888');    // 'voip alumni' role

      // Add voip role if they don't have it
      if (!newMember.roles.has(voipRole.id)) {
        newMember.addRole(voipRole);
      }

      // Add voice activity role if they don't have it and aren't alumni
      if (!newMember.roles.has(voipAlumniRole.id)) {
        newMember.addRole(voiceActivityRole);
        newMember.addRole(voipAlumniRole);
      }
    }
  } catch(e) {
    // Something went wrong
    console.log(`GMBot encountered an error on voice status update:\n\n${e}`);
  }
}

/**
 * Called whenever a message is updated
 * @param oldMsg The message before the update
 * @param newMsg The message after the update
 */
function onBotMessageUpdate(oldMsg: Message, newMsg: Message) {
  // Don't respond to bots
  if (newMsg.author.bot) return;

  // Catch clean-code and gmlive edits
  prettifier(newMsg) || gmlive(newMsg);
}

/**
 * Called whenever a message is created
 * @param msg The created message
 */
function onBotMessage(msg: Message) {
  // Don't respond to bots
  if (msg.author.bot) return;

  // Check for image spam
  if (msg.channel.type !== 'dm') {
    handleImages(msg, imageOptions);
  }

  // Catch bad links
  if (!catchBadMessages(msg)) {

    // Parse message for commands or matches
    if (!parseCommandList(rules, msg)) {

      // If no command was hit, check for modifiers
      prettifier(msg) || gmlive(msg) || gml(msg) || devmode(msg, bot) || haste(msg);
    }
  }
}

/**
 * Catches bad links as specified in the bad-links json
 * @param msg The discord message to parse
 */
function catchBadMessages(msg: Message) {
  if (detectBadLink(msg.content)) {
    // RED ALERT OH SHIT
    console.log('Deleted a message containing a bad link.');

    // Contact the dingus brigade
    console.log(`Deleted a message with a bad link. The person that posted it was ${msg.author.username}\nThe content of the message was:\n\n${msg.content}`);

    // Delete the uh-oh
    msg.delete();

    // Publicly shame the dingus who did the dirty
    msg.channel.send(`Heads up! @${msg.author.username} tried to post a malicious link. The admins have been made aware of this.`);

    return true;
  } else {
    return false;
  }
}

function detectBadLink(str: string) {
  return new RegExp(badlinks.join('|')).test(str);
}

/**
 * Handles a user uploading too many images in a given time frame
 * @param msg The message that was sent
 */
function handleImages(msg: Message, imgOptions) {
  // Be certain this was in a channel
  if (msg.member) {
    // If the user is no higher than a voip user
    if ((msg.member.highestRole.name === '@everyone') ||
    (msg.member.highestRole.name === 'voip')) {
      // Get the attachments
      let attachments = msg.attachments.array();

      // If there are any
      if (attachments.length !== 0) {
        // Iterate over them
        attachments.forEach(attachment => {
          // Ensure the attachment is an image
          if (attachment.height !== undefined) {
            // If this user hasn't recently uploaded
            if ((imgOptions.imageLog[msg.author.id] === undefined) || (imgOptions.imageLog[msg.author.id] === 0)) {
              // Increase the allowance counter for this user
              imgOptions.imageLog[msg.author.id] = 1;

              // Reset this user's counter in a short period of time
              imgOptions.imageLog.timers[msg.author.id] = setTimeout(() => {
                // Reset the counter for this user
                imgOptions.imageLog[msg.author.id] = 0;
              }, imgOptions.imageTimer);
            } else { // This user has recently uploaded
              // If the user has uploaded more than allowed
              if (imgOptions.imageLog[msg.author.id] >= imgOptions.imageCap) {
                // Delete the message
                msg.delete();

                // Send them a DM notifying them of this issue
                msg.author.send('Your post was deleted because you have posted too many images recently! Please wait a few minutes and try again.');
              } else {
                // The user hasn't uploaded more than allowed, so just increment their counter
                imgOptions.imageLog[msg.author.id]++;
              }
            }
          }
        });
      }
    }
  }
}

// Handle process-wide promise rejection
process.on('unhandledRejection', (reason) => {
  console.log(`Unhandled promise: ${reason}`);
});

// Handle process-wide uncaught exceptions
process.on('uncaughtException', (err) => {
  let errorMessage = `GMBot has encoutered an uncaught exception:\n\`\`\`${err}\`\`\``;

  // Send error to the bot testing channel
  let botTestingChannel = channelService.getChannelByID('417796218324910094');
  if (botTestingChannel) botTestingChannel.send(errorMessage);

  console.log(`\n${errorMessage}\n`);
});

// Copyright information
console.log(`GameMakerBot v${require('./package.json').version}`);

// Login the bot using the auth token from auth.json
bot.login(auth.token);

// Express setup
express.run(bot);

// For testing
module.exports = {
  handleImages: handleImages,
  detectBadLink: detectBadLink
};

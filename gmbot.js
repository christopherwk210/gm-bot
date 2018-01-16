/**
 * GameMakerBot
 * Copyright © 2017 Chris Anselmo <christopherwk210@gmail.com> & contributors.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

// Init discord api
const Discord = require('discord.js');
const bot = new Discord.Client();

// Project libs
const database = require('./src/lib/utils/database.js');
const rules = require('./src/lib/rules.js');
const prettifier = require('./src/lib/modifiers/prettifier.js');
const gmlive = require('./src/lib/modifiers/gmlive.js');
const devmode = require('./src/lib/modifiers/devmode.js');
const gml = require('./src/lib/modifiers/gml.js');
const express = require('./src/express/express.js');
const logVoip = require('./src/lib/logging/voipLog.js');
const logPresence = require('./src/lib/logging/presenceLog.js');
const parseCommandList = require('./src/lib/utils/parseCommandList.js');
const welcome = require('./src/lib/commands/welcome.js');

// Project data
const ids = require('./src/assets/json/ids.json');
const badlinks = require('./src/assets/json/bad-links.json');

// Database setup
let db = database.initializeDatabase();

// Temp user storage
let responsibleUsers = [];

// Keep recent bot-dm log history in memory for the front-end
let dmLog = {};

// How often to log user presence
let profileInterval = 3600000;

// Image upload limitting
let imageOptions = {
  imageLog: {
    timers: []
  },
  imageCap: 3,              // 3 images within
  imageTimer: 1000 * 60 * 5 // 5 minutes
};

// Auth token
let auth;

// Import authorization token
try {
  // Attempt to sync load auth.json
  auth = require('./src/assets/json/auth.json');
} catch (e) {
  // Well shit, ya didn't read the instructions did ya?
  console.log('No auth.json found. Please see /src/assets/auth.example.json.\n' + e.stack);

  // Goodbye
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
  // Tell the world our feelings
  console.log('Squaring to go, captain.');
  
  // Fetch net8floz
  bot.fetchUser(ids.net8floz).then(user => { responsibleUsers.push(user); }, err => console.log(err));

  // Fetch topherlicious
  bot.fetchUser(ids.topherlicious).then(user => { responsibleUsers.push(user); }, err => console.log(err));

  // Grab our guild
  let guildCollection = bot.guilds.find('name','/r/GameMaker');

  // Log user presence on startup
  logPresence(guildCollection, db);

  // Begin logging on interval
  setInterval(() => {
    logPresence(guildCollection, db);
  }, profileInterval || 3600000);
}

/**
 * Called whenever a user changes voice state
 * @param {GuildMember} oldMember The member before the voice state update
 * @param {GuildMember} newMember The member after the voice state update
 */
function onBotVoiceStateUpdate(oldMember, newMember) {
  // Log voip data
  logVoip(oldMember, newMember, db);
  
  // Attempt to add voip_text role
  try {
    // Determine they are a member and in the voip channel
    if (newMember && newMember.voiceChannel && (newMember.voiceChannel.name.includes('casual') || newMember.voiceChannel.name.includes('chilled') || newMember.voiceChannel.name.includes('game'))) {
      // Fetch the proper roles
      var voipRole = newMember.guild.roles.find('name', 'voip');
      var voiceActivityRole = newMember.guild.roles.find('name', 'voice activity');
      var voipAlumniRole = newMember.guild.roles.find('name', 'voip alumni');

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
    console.log('An error occurred trying to auto-add the voip role on user joining the voip channel');

    // Alert the peeps in charge of fixing it
    responsibleUsers.forEach(user => {
      user.send('GMBot encountered an error on voice status update:\n\n' + e);
    });
  }
}

/**
 * Called whenever a message is updated
 * @param {Message} oldMsg The message before the update
 * @param {Message} newMsg The message after the update
 */
function onBotMessageUpdate(oldMsg, newMsg) {
  // Don't respond to bots
  if (newMsg.author.bot) { return; }

  // Catch clean-code and gmlive edits
  prettifier(newMsg) || gmlive(newMsg);
}

/**
 * Called whenever a message is created
 * @param {Message} msg The created message
 */
function onBotMessage(msg) {
  // Don't respond to bots
  if (msg.author.bot) { return; }

  // Intercept all DM's
  if (msg.channel.type === 'dm') {
    // Log this DM
    handleDM(msg);
  } else {
    // Check for image spam
    handleImages(msg, imageOptions);
  }

  // Catch bad links
  if (!catchBadMessages(msg)) {
    // Parse message for commands or matches
    if (!parseCommandList(rules, msg)) {
      // If no command was hit, check for modifiers
      prettifier(msg) || gmlive(msg) || gml(msg) || devmode(msg);
    }
  }
}

/**
 * Catches bad links as specified in the bad-links.json
 * @param {Message} msg The discord message to parse
 */
function catchBadMessages(msg) {
  if (detectBadLink(msg.content)) {
    // RED ALERT OH SHIT
    console.log('Deleted a message containing a bad link.');

    // Contact the dingus brigade
    responsibleUsers.forEach(user => {
      user.send('Deleted a message with a bad link. The person that posted it was ' + msg.author.username + '\nThe content of the message was:\n\n' + msg.content);
    });

    // Delete the uh-oh
    msg.delete();

    // Publicly shame the dingus who did the dirty
    msg.channel.send('Heads up! @' + msg.author.username + ' tried to post a malicious link. The admins have been made aware of this.');

    return true;
  } else {
    return false;
  }
}

function detectBadLink(str) {
  return new RegExp(badlinks.join('|')).test(str);
}

/**
 * Handles keeping track of the most recent DM's to the bot
 * for use with the bot front-end
 * @param {Message} msg The message that was sent
 */
function handleDM(msg) {
  // If this user has not yet sent a message during this session
  if (dmLog[msg.author.username] === undefined) {
    // Take initial note of it under their name
    dmLog[msg.author.username] = {
      user_id: msg.author ? msg.author.id : -1,   // Their ID
      message_id: msg.id,        // The message ID
      new_message: msg.content,  // The newest message content
      messages: [                // Log of old messages
        {
          user: msg.author.username,  // Author username
          message: msg.content        // Message content
        }
      ]
    }
  } else {
    // The user has already sent a message during this session
    dmLog[msg.author.username].message_id = msg.id;       // Record their ID (a little redundant)
    dmLog[msg.author.username].new_message = msg.content; // Indicate the new message content
    dmLog[msg.author.username].messages.push({            // Store this message with the rest
      user: msg.author.username, // Author username
      message: msg.content       // Message content
    });
  }
}

/**
 * Handles a user uploading too many images in a given time frame
 * @param {Message} msg The message that was sent
 */
function handleImages(msg, imgOptions) {
  // Be certain this was in a channel
  if (msg.member) {
    // If the user is no higher than a voip user
    if ((msg.member.highestRole === '@everyone') ||
    (msg.member.highestRole === 'voip')) {
      // Get the attachments
      var attachments = msg.attachments.array();

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
  console.log('Unhandled promise: ' + reason);
});

// Handle process-wide uncaught exceptions
process.on('uncaughtException', (err) => {
  // Alert the folks behind the curtain
  responsibleUsers.forEach(user => {
    user.send('GMBot has encoutered an uncaught exception. Attempting to a log of the error:\n\n' + err);
  });
});

// Copyright information
console.log('GameMakerBot v' + require('./package.json').version);
console.log('Copyright © 2017 Chris "topherlicious" Anselmo & Contributors\nThis program comes with ABSOLUTELY NO WARRANTY.\n');

// Login the bot using the auth token from auth.json
bot.login(auth.token);

// Express setup
express.run(bot, dmLog, db);

// For testing
module.exports = {
  handleImages: handleImages,
  detectBadLink: detectBadLink
};

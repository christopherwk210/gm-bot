/**
 * GameMakerBot!
 * Chris "Topher" Anselmo <christopherwk210@gmail.com> & contributors.
 * MIT License
 */

// Init discord api
import { Message, Client, GuildMember, TextChannel, MessageReaction, User, PartialUser, MessageAttachment } from 'discord.js';
const bot = new Client();

// Config
import { serverIDs, shouldDieOnException, shouldPrintStackTrace } from './src/config';

// Utils
import { parseCommandList, parseModifierList, Rule, Type , detectSpamMessage, detectOutsideStaff, detectStaff } from './src/shared';
import './src/shared/utils/choose';

// Express
import runExpressServer from './src/express/express';

// Services
import {
  roleService,
  docService,
  guildService,
  channelService,
  markdownService,
  textService,
  jsonService,
  giveawayService,
  helpChannelService,
  helpcardService,
  securityService,
  birthdayService,
  voiceChannelService,
  reactRoleDistributionService
} from './src/shared';

// Rules
import { loadRules, loadModifiers } from './src/rules';
let rules: (Rule | Type<any>)[] = [];
let modifiers: Type<any>[] = [];

// Commands
import { WelcomeCommand, SecurityCommand } from './src/commands';

import { handleAutoHasteMessage } from './src/auto-haste';

// Initialize file based services
markdownService.loadAllMarkdownFiles();
textService.loadAllTextFiles();
jsonService.loadAlljsonFiles();
helpcardService.loadHelpcards();
reactRoleDistributionService.init();

// Load JSON
const auth = jsonService.files['auth'];

// Well shit, ya didn't read the instructions did ya?
if (!auth) {
  console.log('No auth.json found. Please see README.md and ./src/shared/assets/auth.example.json.');
  process.exit();
}

// Bot callbacks
bot.on('ready', onBotReady);                        // Bot is loaded
bot.on('messageUpdate', onBotMessageUpdate);        // Message updated
bot.on('message', onBotMessage);                    // Message sent (in DM or in server channel)
bot.on('error', onBotError);                        // Bot encountered an error
bot.on('messageReactionAdd', onBotReactionAdd);     // New reaction added to message
bot.on('messageReactionRemove', onBotReactionRemove);
bot.on('guildMemberAdd', user => {                  // New user joined
  WelcomeCommand.sendWelcomeMessage(user);
  SecurityCommand.newUserSecurity(user);
});

/**
 * Called when the bot has reported ready status
 */
function onBotReady() {
  // Initialize services
  roleService.init(bot);
  guildService.init(bot);
  channelService.init(bot);
  docService.init();

  helpChannelService.cacheHelpChannels();
  voiceChannelService.init();
  birthdayService.init(bot);

  // Load all rules
  rules = loadRules();
  modifiers = loadModifiers();

  // Tell the world our feelings
  console.log('Squaring to go, captain.');
}

/**
 * Called whenever a message is updated
 * @param oldMsg The message before the update
 * @param newMsg The message after the update
 */
function onBotMessageUpdate(oldMsg: Message, newMsg: Message) {
  // Don't respond to bots
  if (newMsg.author.bot) return;

  return bot;
}

/**
 * Called whenever a message is created
 * @param msg The created message
 */
function onBotMessage(msg: Message) {
  // Don't respond to bots
  if (msg.author.bot) return;

  // nice
  if (msg.author.id === '144913457429348352' && msg.content === 'nice') msg.channel.send('nice');

  // Send the message along to the HelpChannelService
  helpChannelService.handleMessage(msg);

  // Also send it along to the VoiceChannelService!
  voiceChannelService.handleMessage(msg);

  // Is this spam?
  detectSpamMessage(msg);

  // Handle attachments for auto-uploading GML files to haste
  handleAutoHasteMessage(msg);

  // Parse message for commands or matches
  if (parseCommandList(rules, msg)) return;

  // If no command was hit, check for modifiers
  parseModifierList(modifiers, msg);
}

async function onBotReactionRemove(reaction: MessageReaction, user: User | PartialUser) {
  let fullUser: User;

  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  fullUser = user.partial ? await user.fetch() : user as any;

  // Loop through reaction add tracked messages
  for (const msg of reactRoleDistributionService.currentMessages) {

    // If the message being reacted to is one of those messages..
    if (reaction.message.id === msg.messageID) {

      // Loop through the roles for this configured message
      for (const r of msg.config.roles) {

        // Once we find the role associated with this emoji
        if ((r.emoji && reaction.emoji.name.includes(r.emoji)) || reaction.emoji.name.includes(r.emojiName)) {

          // Get the role by id in the config
          const role = roleService.getRoleByID(r.roleID);

          // Fetch the guild memeber object
          reaction.message.guild.members.fetch(fullUser).then(member => {

            // Apply the role
            member.roles.remove(role).then(m => {
              m.send(`The ${role.name} role has been removed!`);
            });
          }).catch(err => {
            // Could not get member that reacted.
            console.log('Could not get member for user:', user.username);
          });
        }
      }
    }
  }

  return bot;
}

async function onBotReactionAdd(reaction: MessageReaction, user: User | PartialUser) {
  let fullUser: User;

  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  fullUser = user.partial ? await user.fetch() : user as any;

  if (detectOutsideStaff(fullUser) === 'admin' && reaction.emoji.name === '✅') {
    const fetchedUsers = await reaction.users.fetch();

    const winner = fetchedUsers.array().choose();
    user.send(`Winner chosen: ${winner.username}#${winner.discriminator}`);
  } else {
    // Loop through reaction add tracked messages
    for (const msg of reactRoleDistributionService.currentMessages) {

      // If the message being reacted to is one of those messages..
      if (reaction.message.id === msg.messageID) {

        // Loop through the roles for this configured message
        for (const r of msg.config.roles) {

          // Once we find the role associated with this emoji
          if ((r.emoji && reaction.emoji.name.includes(r.emoji)) || reaction.emoji.name.includes(r.emojiName)) {

            // Get the role by id in the config
            const role = roleService.getRoleByID(r.roleID);

            // Fetch the guild memeber object
            reaction.message.guild.members.fetch(fullUser).then(member => {

              // Apply the role
              member.roles.add(role).then(m => {
                m.send(`You've been given the ${role.name} role!`);
              });
            }).catch(err => {
              // Could not get member that reacted.
              console.log('Could not get member for user:', user.username);
            });
          }
        }
      }
    }
  }

  return bot;
}

/**
 * Called whenever the bot client encounters an internal error
 * @param error The client error
 */
function onBotError(error: Error) {
  console.log('\nThe bot client encountered an error:\n', error.message);
}

// This is to handle emoji reactions on uncached messages
bot.on('raw', packet => {

  // We don't want this to run on unrelated packets
  if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

  // Grab the channel to check the message from
  const channel = bot.channels.cache.get(packet.d.channel_id);

  // There's no need to emit if the message is cached, because the event will fire anyway for that
  if (!channel || (channel as any).messages.has(packet.d.message_id)) return;

  // Since we have confirmed the message is not cached, let's fetch it
  (channel as any).fetchMessage(packet.d.message_id).then(message => {
      // Emojis can have identifiers of name:id format, so we have to account for that case as well
      const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;

      // This gives us the reaction we need to emit the event properly, in top of the message object
      const reaction = message.reactions.get(emoji);

      // Adds the currently reacting user to the reaction's users collection.
      if (reaction) reaction.users.set(packet.d.user_id, bot.users.cache.get(packet.d.user_id));

      // Check which type of event it is before emitting
      if (packet.t === 'MESSAGE_REACTION_ADD') {
          bot.emit('messageReactionAdd', reaction, bot.users.cache.get(packet.d.user_id));
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
          bot.emit('messageReactionRemove', reaction, bot.users.cache.get(packet.d.user_id));
      }
  });
});

// Handle process-wide promise rejection
process.on('unhandledRejection', reason => {
  console.log(`Unhandled promise: ${reason}`);
});

// Handle process-wide exceptions
process.on('uncaughtException', async err => {
  let errorMessage = `GMBot has encoutered an uncaught exception:\n\`\`\`${err}\`\`\``;

  if (shouldPrintStackTrace) errorMessage += `\n\`\`\`${err.stack}\`\`\``;

  // Send error to the bot testing channel
  const botTestingChannel: TextChannel = <any>channelService.getChannelByID(serverIDs.channels.botTestingChannelID);
  if (botTestingChannel) await botTestingChannel.send(errorMessage);

  console.log(`\n${errorMessage}\n`);

  if (shouldDieOnException) process.exit(-1);
});

// Copyright information
console.log(`GameMakerBot v${require('./package.json').version}`);

// Express setup
runExpressServer();

// Login the bot using the auth token from auth.json
bot.login(auth.token)
  .catch(err => {
    console.error(err);
  });

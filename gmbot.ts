/**
 * GameMakerBot!
 * Chris "Topher" Anselmo <christopherwk210@gmail.com> & contributors.
 * MIT License
 */

// Init discord api
import { Message, Client, GuildMember, TextChannel } from 'discord.js';
const bot = new Client();

// Config
import {
  shouldDieOnException,
  botTestingChannelID,
  casualVoiceChannelID,
  coworkingVoiceChannelID,
  playinagameVoiceChannelID,
  voipRoleID,
  voiceactivityRoleID,
  voicealumniRoleID
} from './src/config';

// Utils
import { parseCommandList, parseModifierList, Rule, Type } from './src/shared';

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
  securityService
} from './src/shared';

// Rules
import { loadRules, loadModifiers } from './src/rules';
let rules: (Rule | Type<any>)[] = [];
let modifiers: Type<any>[] = [];

// Commands
import { WelcomeCommand, SecurityCommand } from './src/commands';

// Initialize file based services
markdownService.loadAllMarkdownFiles();
textService.loadAllTextFiles();
jsonService.loadAlljsonFiles();
helpcardService.loadHelpcards();

// Load JSON
const auth = jsonService.files['auth'];

// Well shit, ya didn't read the instructions did ya?
if (!auth) {
  console.log('No auth.json found. Please see README.md and ./src/shared/assets/auth.example.json.');
  process.exit();
}

// Bot callbacks
bot.on('ready', onBotReady);                        // Bot is loaded
bot.on('voiceStateUpdate', onBotVoiceStateUpdate);  // Voice activity change
bot.on('messageUpdate', onBotMessageUpdate);        // Message updated
bot.on('message', onBotMessage);                    // Message sent (in DM or in server channel)
bot.on('guildMemberAdd', user => {
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
  helpChannelService.cacheHelpChannels();
  docService.init();

  // Load all rules
  rules = loadRules();
  modifiers = loadModifiers();

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
        newMember.voiceChannel.id === casualVoiceChannelID ||    // Casual
        newMember.voiceChannel.id === coworkingVoiceChannelID || // Coworking
        newMember.voiceChannel.id === playinagameVoiceChannelID  // Playin a game
      )
    ) {
      // Fetch the proper roles
      const voipRole = roleService.getRoleByID(voipRoleID);          // 'voip' role
      const voiceActivityRole = roleService.getRoleByID(voiceactivityRoleID); // 'voice activity' role
      const voipAlumniRole = roleService.getRoleByID(voicealumniRoleID);    // 'voip alumni' role

      // If there's no voip role to use... dont do anything else
      if (!voipRole) return;

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
  } catch (e) {
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
}

/**
 * Called whenever a message is created
 * @param msg The created message
 */
function onBotMessage(msg: Message) {
  // Don't respond to bots
  if (msg.author.bot) return;

  // Send the message along to the HelpChannelService
  helpChannelService.handleMessage(msg);

  // Apply the will of the almighty tophtoken manager
  if (msg.member && !!~msg.member.displayName.toLowerCase().indexOf('tophtoken')) {
    msg.react(guildService.guild.emojis.find('name', 'tophtoken'));
  }

  // Parse message for commands or matches
  if (parseCommandList(rules, msg)) return;

  // If no command was hit, check for modifiers
  parseModifierList(modifiers, msg);
}

// Handle process-wide promise rejection
process.on('unhandledRejection', reason => {
  console.log(`Unhandled promise: ${reason}`);
});

// Handle process-wide exceptions
process.on('uncaughtException', err => {
  const errorMessage = `GMBot has encoutered an uncaught exception:\n\`\`\`${err}\`\`\``;

  // Send error to the bot testing channel
  const botTestingChannel: TextChannel = <any>channelService.getChannelByID(botTestingChannelID);
  if (botTestingChannel) botTestingChannel.send(errorMessage);

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

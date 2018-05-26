import path = require('path');
import { Attachment } from 'discord.js';

// Config
import { prefixedCommandRuleTemplate } from './config';

// Commands
const assemble = require('./commands/assemble');
const commandment = require('./commands/commandment');
const audio = require('./commands/audio');
const christmas = require('./commands/christmas');
const palette = require('./commands/palette');
const say = require('./commands/say');
const giveAwayManagement = require('./commands/giveAwayManagement');
const miniboss = require('./commands/miniboss');

import {
  WelcomeCommand,
  ResourcesCommand,
  RoleControlCommand,
  HelpCommand,
  DocsCommand,
  ChangelogCommand,
  ResizeCommand,
  PixelChallengeCommand,
  MarketplaceCommand,
  GithubCommand,
  SayCommand
} from './commands';

// Project utils
import { detectStaff, choose, createTextRule } from './shared';

// Giveaway Functions
import { handleGiveawayMessage } from './shared';

// Types
import { Rule, TextChannelMessage, Type } from './shared';

/**
 * Functional utility commands
 */
let coreCommands: (Rule|Type<any>)[] = [
  WelcomeCommand,
  ResourcesCommand,
  RoleControlCommand,
  HelpCommand,
  DocsCommand,
  ChangelogCommand,
  ResizeCommand,
  PixelChallengeCommand,
  MarketplaceCommand,
  GithubCommand,
  {
    matches: ['miniboss', 'mb', 'pedro', 'saint11'],
    ...prefixedCommandRuleTemplate,
    action: miniboss
  },
  {
    // Because no one knows how to spell palette
    matches: ['palette', 'pallete', 'palete'],
    ...prefixedCommandRuleTemplate,
    action: palette
  },
  {
    matches: ['giveaway', 'giveaways'],
    ...prefixedCommandRuleTemplate,
    action: handleGiveawayMessage
  },
  {
    matches: ['3d'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      let roleCommand = new RoleControlCommand();
      roleCommand.action(msg, ['3d', '3D']);
    }
  },
  createTextRule(
    ['lospec', 'palettes', 'palette-list'],
    'Here\'s a list of useful palettes:\nhttps://lospec.com/palette-list'
  )
];

/**
 * Admin only commands
 */
let adminCommands: (Rule|Type<any>)[] = [
  SayCommand,
  {
    matches: ['gaa'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member) === 'admin',
    action: giveAwayManagement
  }
];

/**
 * Bot developer only commands
 */
let devCommands: Rule[] = [
  {
    matches: ['id'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member) === 'admin' || msg.member.roles.has('417797331409436682'),
    action: (msg: TextChannelMessage) => {
      msg.author.send(`\`${msg.channel.name}\` id: \`${msg.channel.id}\``);
    }
  }
];

/**
 * Voice channel related commands
 */
let audioCommands: Rule[] = [
  {
    matches: ['play'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: audio.play
  },
  {
    matches: ['resume'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: audio.resume
  },
  {
    matches: ['pause'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: audio.pause
  },
  {
    matches: ['skip'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: audio.skip
  },
  {
    matches: ['queue'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: audio.getQueue
  },
  {
    matches: ['volume'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: audio.setVolume
  },
  {
    matches: ['kick'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: audio.stop
  }
];

/**
 * Misc silly shit
 */
let easterEggs: Rule[] = [
  {
    matches: ['christmascycle'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: msg => christmas.cycle(msg)
  },
  {
    matches: ['christmasautocycle'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: msg => christmas.autoCycle(msg)
  },
  {
    matches: ['lifetime'],
    ...prefixedCommandRuleTemplate,
    action: (msg, args) => {
      if (args.length > 1) {
        if (msg.guild) {
          let member = msg.guild.members.get(args[1].replace(/[<!@>]+/g, ''));
          if (member) {
            msg.channel.send(`${member.displayName} has been a member of this server since ${member.joinedAt}.`);
          } else {
            msg.channel.send('Could not find specified user');
          }
        } else {
          msg.channel.send('You can only use this in the /r/GameMaker server.');
        }
      } else if (msg.member) {
        msg.channel.send(`${msg.member.displayName}, you have been a member of this server since ${msg.member.joinedAt}.`);
      } else {
        msg.channel.send('You can only use this in the /r/GameMaker server.');
      }
    }
  },
  {
    matches: ['quackquackquack', 'assemble'],
    ...prefixedCommandRuleTemplate,
    pre: msg => !!detectStaff(msg.member),
    action: assemble
  },
  createTextRule(
    ['toph', 'tophy', 'tophie', 'topher', 'topherlicious', 'whosyourdaddy'],
    `${choose([
      'Paging',
      'Come in',
      'Oi, where are ya',
      'Where art thou',
      'Someone needs ya',
      'Your presence is requested'
    ])} <@144913457429348352>`
  ),
  {
    matches: ['commandment'],
    ...prefixedCommandRuleTemplate,
    action: commandment
  },
  {
    matches: ['rtfm'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      commandment(msg, ['rtfm', 'I']);
    }
  },
  createTextRule(
    ['bgmhammer'],
    ':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:'
  ),
  createTextRule(
    ['dinguses'],
    ':raised_hand: ***dinguses*** :raised_back_of_hand:'
  ),
  createTextRule(
    ['dingus'],
    ':raised_hand: ***dingus*** :raised_back_of_hand:'
  ),
  createTextRule(
    ['givesidadonut'],
    ':doughnut:'
  ),
  {
    matches: ['good bot'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      msg.react('❤');
    }
  },
  {
    matches: ['mm'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      msg.react('🇲')
        .then(() => msg.react('Ⓜ'));
    }
  },
  {
    matches: ['mmm'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      const mes = msg.guild.emojis.find('name', 'meseta');
      msg.react('🇲')
        .then(() => msg.react('Ⓜ'))
        .then(() => msg.react(mes))
        .catch(() => {});

    }
  },
  {
    matches: ['<@361088614735544320>'],
    action: msg => {
      msg.react('🇸')
        .then(() => msg.react('🇦'))
        .then(() => msg.react('🇷'))
        .then(() => msg.react('🅰'))
        .catch(err => {
          console.error(err)
        });
    }
  },
  createTextRule(
    ['<:cokecan:442133530689011712> <:cokecan:442133530689011712> <:cokecan:442133530689011712>', '<:cokecan:410684792263409664> <:cokecan:410684792263409664> <:cokecan:410684792263409664>'],
    '<@141365209435471872>'
  ),
  createTextRule(
    ['💤👁️', '💤 👁'],
    '<@240306552949440512>'
  ),
  {
    matches: ['hmm'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      msg.react('🇭')
        .then(() => msg.react('🇲'))
        .then(() => msg.react('Ⓜ'));
    }
  },
  {
    matches: ['<@295327000372051968>'],
    action: msg => {
      msg.react('👋');
    }
  },
  createTextRule(
    ['🎁 💀', '🎁💀'],
    '<@277615099034730506>'
  ),
  createTextRule(
    ['1⃣ 3⃣', '1⃣3⃣'],
    '<@121017818778042368>'
  ),
  createTextRule(
    ['inversekinematics'],
    '<@227032791013916672>'
  ),
  {
    matches: ['~kissfromarose~'],
    exact: false,
    wholeMessage: true,
    delete: true,
    action: msg => {
      msg.channel.send({
        file: new Attachment(path.join(__dirname, '../assets/images/kissfromarose.gif')),
        name: 'kiss-from-a-rose.gif'
      });
    }
  }
];

// Message rules
export = [
  ...coreCommands,
  ...adminCommands,
  ...devCommands,
  ...audioCommands,
  ...easterEggs
];

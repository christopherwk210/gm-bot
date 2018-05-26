import path = require('path');
import { Attachment } from 'discord.js';

// Config
import { prefixedCommandRuleTemplate } from './config';

const audio = require('./commands/audio');
const christmas = require('./commands/christmas');
const palette = require('./commands/palette');
// const miniboss = require('./commands/miniboss');

// Commands
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
  SayCommand,
  GiveawayManagementCommand,
  AssembleCommand,
  CommandmentCommand,
  LifetimeCommand
} from './commands';

// Project utils
import { detectStaff, choose, RuleFactory, guildService } from './shared';

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
  AssembleCommand,
  // {
  //   matches: ['miniboss', 'mb', 'pedro', 'saint11'],
  //   ...prefixedCommandRuleTemplate,
  //   action: miniboss
  // },
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
    action: msg => new RoleControlCommand().action(msg, ['3d', '3D'])
  },
  RuleFactory.createTextRule(
    ['lospec', 'palettes', 'palette-list'],
    'Here\'s a list of useful palettes:\nhttps://lospec.com/palette-list'
  )
];

/**
 * Admin only commands
 */
let adminCommands: (Rule|Type<any>)[] = [
  SayCommand,
  GiveawayManagementCommand
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
let easterEggs: (Rule|Type<any>)[] = [
  AssembleCommand,
  CommandmentCommand,
  LifetimeCommand,
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
  RuleFactory.createTextRule(
    ['toph', 'tophy', 'tophie', 'topher', 'topherlicious', 'whosyourdaddy'],
    `${choose(['Paging', 'Come in', 'Where art thou', 'Someone needs ya',])} <@144913457429348352>`
  ),
  RuleFactory.createTextRule(
    ['bgmhammer'],
    ':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:'
  ),
  RuleFactory.createTextRule(
    ['dinguses'],
    ':raised_hand: ***dinguses*** :raised_back_of_hand:'
  ),
  RuleFactory.createTextRule(
    ['dingus'],
    ':raised_hand: ***dingus*** :raised_back_of_hand:'
  ),
  RuleFactory.createTextRule(
    ['givesidadonut'],
    ':doughnut:'
  ),
  RuleFactory.createTextRule(
    ['<:cokecan:442133530689011712> <:cokecan:442133530689011712> <:cokecan:442133530689011712>', '<:cokecan:410684792263409664> <:cokecan:410684792263409664> <:cokecan:410684792263409664>'],
    '<@141365209435471872>'
  ),
  RuleFactory.createTextRule(
    ['💤👁️', '💤 👁'],
    '<@240306552949440512>'
  ),
  RuleFactory.createTextRule(
    ['🎁 💀', '🎁💀'],
    '<@277615099034730506>'
  ),
  RuleFactory.createTextRule(
    ['1⃣ 3⃣', '1⃣3⃣'],
    '<@121017818778042368>'
  ),
  RuleFactory.createTextRule(
    ['inversekinematics'],
    '<@227032791013916672>'
  ),
  RuleFactory.createReactionRule(
    ['<@295327000372051968>'],
    ['👋']
  ),
  RuleFactory.createReactionRule(
    ['<@361088614735544320>'],
    ['🇦', '🇷', '🅰']
  ),
  {
    ...RuleFactory.createReactionRule(
      ['hmm'],
      ['🇭', '🇲', 'Ⓜ']
    ),
    exact: false,
    wholeMessage: true
  },
  {
    ...RuleFactory.createReactionRule(
      ['good bot'],
      ['❤']
    ),
    exact: false,
    wholeMessage: true
  },
  {
    ...RuleFactory.createReactionRule(
      ['mm'],
      ['🇲', 'Ⓜ']
    ),
    exact: false,
    wholeMessage: true
  },
  {
    ...RuleFactory.createReactionRule(
      ['mmm'],
      ['🇲', 'Ⓜ', guildService.guild.emojis.find('name', 'meseta')]
    ),
    exact: false,
    wholeMessage: true
  },
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

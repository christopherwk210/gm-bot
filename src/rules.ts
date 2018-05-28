import * as path from 'path';
import { Attachment } from 'discord.js';

// Config
import { prefixedCommandRuleTemplate } from './config';

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
  LifetimeCommand,
  ChristmasCommand,
  AudioCommand
} from './commands';

// Project utils
import { detectStaff, RuleFactory, guildService } from './shared';
import './shared/utils/choose';

// Giveaway Functions
import { handleGiveawayMessage } from './shared';

// Types
import { Rule, TextChannelMessage, Type } from './shared';

/** Loads all rules into memory */
export function loadRules() {

  /** Functional utility commands */
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
    AudioCommand,
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
    RuleFactory.createReplyRule(
      ['lospec', 'palettes', 'palette-list'],
      'Here\'s a list of useful palettes:\nhttps://lospec.com/palette-list'
    )
  ];

  /** Admin only commands */
  let adminCommands: (Rule|Type<any>)[] = [
    SayCommand,
    GiveawayManagementCommand
  ];

  /** Bot developer only commands */
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

  /** Random fun stuffs */
  let easterEggs: (Rule|Type<any>)[] = [
    AssembleCommand,
    CommandmentCommand,
    LifetimeCommand,
    ChristmasCommand
  ];

  /** Reply RuleFactor rules */
  let replyRules: Rule[] = [
    RuleFactory.createReplyRule(
      ['toph', 'tophy', 'tophie', 'topher', 'topherlicious', 'whosyourdaddy'],
      `${['Paging', 'Come in', 'Where art thou', 'Someone needs ya'].choose()} <@144913457429348352>`
    ),
    RuleFactory.createReplyRule(
      ['bgmhammer'],
      ':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:'
    ),
    RuleFactory.createReplyRule(
      ['dinguses'],
      ':raised_hand: ***dinguses*** :raised_back_of_hand:'
    ),
    RuleFactory.createReplyRule(
      ['dingus'],
      ':raised_hand: ***dingus*** :raised_back_of_hand:'
    ),
    RuleFactory.createReplyRule(
      ['givesidadonut'],
      ':doughnut:'
    ),
    RuleFactory.createReplyRule(
      ['~kissfromarose~'],
      {
        file: new Attachment(path.join(__dirname, './shared/assets/images/kissfromarose.gif')),
        name: 'kiss-from-a-rose.gif'
      },
      false,
      true
    ),
    RuleFactory.createReplyRule(
      [
        '<:cokecan:442133530689011712> <:cokecan:442133530689011712> <:cokecan:442133530689011712>',
        '<:cokecan:410684792263409664> <:cokecan:410684792263409664> <:cokecan:410684792263409664>'
      ],
      '<@141365209435471872>'
    ),
    RuleFactory.createReplyRule(
      ['💤👁️', '💤 👁'],
      '<@240306552949440512>'
    ),
    RuleFactory.createReplyRule(
      ['🎁 💀', '🎁💀'],
      '<@277615099034730506>'
    ),
    RuleFactory.createReplyRule(
      ['1⃣ 3⃣', '1⃣3⃣'],
      '<@121017818778042368>'
    ),
    RuleFactory.createReplyRule(
      ['inversekinematics'],
      '<@227032791013916672>'
    )
  ];

  /** React RuleFactor rules */
  let reactRules: Rule[] = [
    RuleFactory.createReactionRule(
      ['<@295327000372051968>'],
      ['👋']
    ),
    RuleFactory.createReactionRule(
      ['<@361088614735544320>'],
      ['🇸', '🇦', '🇷', '🅰']
    ),
    RuleFactory.createReactionRule(
      ['hmm'],
      ['🇭', '🇲', 'Ⓜ'],
      true
    ),
    RuleFactory.createReactionRule(
      ['good bot'],
      ['❤'],
      true
    ),
    RuleFactory.createReactionRule(
      ['mm'],
      ['🇲', 'Ⓜ'],
      true
    ),
    RuleFactory.createReactionRule(
      ['mmm'],
      ['🇲', 'Ⓜ', guildService.guild.emojis.find('name', 'meseta')],
      true
    )
  ];

  return [
    ...coreCommands,
    ...adminCommands,
    ...devCommands,
    ...easterEggs,
    ...replyRules,
    ...reactRules
  ];
}

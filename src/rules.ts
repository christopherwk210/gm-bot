import * as path from 'path';
import { Attachment, RichEmbed } from 'discord.js';

// Config
import { prefixedCommandRuleTemplate, defaultEmbedColor, botcontributerRoleID } from './config';

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
  AudioCommand,
  GiveawayCommand,
  MinibossCommand,
  PaletteCommand,
  UpvoteCommand,
  HelpcardCommand,
  DoneCommand,
  SecurityCommand,
  ActivateLoggingCommand
} from './commands';

// Modifiers
import {
  CleanCodeModifier,
  HasteModifier,
  GmliveModifier,
  GmlModifier,
  DevmodeModifier,
  WrongCodeModifier
} from './modifiers';

// Project utils
import { detectStaff, RuleFactory, guildService } from './shared';
import './shared/utils/choose';

// Types
import { Rule, TextChannelMessage, Type } from './shared';

/** Loads all rules into memory */
export function loadRules() {

  /** Functional utility commands */
  let coreCommands: (Rule | Type<any>)[] = [
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
    GiveawayCommand,
    MinibossCommand,
    PaletteCommand,
    UpvoteCommand,
    HelpcardCommand,
    DoneCommand
  ];

  /** Admin only commands */
  let adminCommands: (Rule | Type<any>)[] = [
    SayCommand,
    GiveawayManagementCommand,
    SecurityCommand
  ];

  /** Bot developer only commands */
  let devCommands: (Rule | Type<any>)[] = [
    {
      matches: ['id'],
      ...prefixedCommandRuleTemplate,
      pre: msg => detectStaff(msg.member) === 'admin' || msg.member.roles.has(botcontributerRoleID),
      action: (msg: TextChannelMessage) => {
        msg.author.send(`\`${msg.channel.name}\` id: \`${msg.channel.id}\``);
      }
    },
    ActivateLoggingCommand
  ];

  /** Random fun stuffs */
  let easterEggs: (Rule | Type<any>)[] = [
    AssembleCommand,
    CommandmentCommand,
    LifetimeCommand,
    ChristmasCommand
  ];

  /** Reply RuleFactor rules */
  let replyRules: Rule[] = [
    RuleFactory.createReplyRule(
      ['lospec', 'palettes', 'palette-list'],
      'Here\'s a list of useful palettes:\nhttps://lospec.com/palette-list'
    ),
    RuleFactory.createReplyRule(
      ['toph', 'tophy', 'tophie', 'topher', 'topherlicious', 'whosyourdaddy'],
      `${['Paging', 'Come in', 'Where art thou', 'Someone needs ya'].choose()} <@144913457429348352>`
    ),
    RuleFactory.createReplyRule(
      ['bgmhammer'],
      ':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:'
    ),
    RuleFactory.createReplyRule(
      ['dinguses', 'DINGUSES'],
      ':raised_hand: ***dinguses*** :raised_back_of_hand:'
    ),
    RuleFactory.createReplyRule(
      ['dingus', 'DINGUS'],
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
      ['codeformatting', 'backtick'],
      new RichEmbed({
        title: 'You can format your code by encapsulating it within three backticks before and after',
        description: '\n\\`\\`\\`\nshow_debug_message("I\'m formatted!");\n\\`\\`\\`\n\n' +
            'The above example displays:\n' +
            '```\nshow_debug_message("I\'m formatted!");\n```\n' +
            `The backtick key can be found above the TAB key on most keyboards.`,
        image: { url: 'https://cdn.discordapp.com/attachments/441976514289074201/456562731903090697/backtick.png' },
        color: defaultEmbedColor
      })
    ),
    RuleFactory.createReplyRule(
      ['jobsheet', 'jobboard'],
      'If you are looking for work or want to put together a team, check out the server job sheet!\n' +
      'Link: <http://bit.ly/2wOh95f>\n' +
      'If you would like to be added to this list, please message an online staff member.'
    ),
    RuleFactory.createReplyRule(
      ['<:cokecan:410684792263409664> <:cokecan:410684792263409664> <:cokecan:410684792263409664>'],
      '<@141365209435471872>',
      false,
      true
    ),
    RuleFactory.createReplyRule(
      ['💤👁️', '💤 👁'],
      '<@240306552949440512>',
      false,
      true
    ),
    RuleFactory.createReplyRule(
      ['🎁 💀', '🎁💀'],
      '<@277615099034730506>',
      false,
      true
    ),
    RuleFactory.createReplyRule(
      ['1⃣ 3⃣', '1⃣3⃣'],
      '<@121017818778042368>',
      false,
      true
    ),
    RuleFactory.createReplyRule(
      ['inversekinematics'],
      '<@227032791013916672>'
    )
  ];

  /** React RuleFactor rules */
  let reactRules: Rule[] = [
    RuleFactory.createReactionRule(
      ['<@295327000372051968>', '<@!295327000372051968>'],
      ['👋']
    ),
    RuleFactory.createReactionRule(
      ['<@361088614735544320>', '<@!361088614735544320>'],
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

/** Loads all modifiers into memory */
export function loadModifiers() {

  /** All bot code block modifiers */
  let modifiers: Type<any>[] = [
    CleanCodeModifier,
    HasteModifier,
    GmliveModifier,
    GmlModifier,
    DevmodeModifier,
    WrongCodeModifier
  ];

  return [
    ...modifiers
  ];
}

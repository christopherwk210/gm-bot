import * as path from 'path';
import { Attachment, RichEmbed } from 'discord.js';

// Config
import { prefixedCommandRuleTemplate, defaultEmbedColor, serverIDs } from './config';

// Commands
import * as commands from './commands';

// Modifiers
import * as modifiers from './modifiers';

// Project utils
import { detectStaff, RuleFactory, guildService } from './shared';
import './shared/utils/choose';

// Types
import { Rule, TextChannelMessage, Type } from './shared';

/** Loads all rules into memory */
export function loadRules() {

  /** Bot developer only commands */
  let devCommands: (Rule | Type<any>)[] = [
    {
      matches: ['id'],
      ...prefixedCommandRuleTemplate,
      pre: msg => detectStaff(msg.member) === 'admin' || msg.member.roles.has(serverIDs.roles.botContributerRoleID),
      action: (msg: TextChannelMessage) => {
        msg.author.send(`\`${msg.channel.name}\` id: \`${msg.channel.id}\``);
      }
    }
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
      ['!dinguses'],
      ':raised_hand: ***dinguses*** :raised_back_of_hand:',
      false,
      true
    ),
    RuleFactory.createReplyRule(
      ['!dingus'],
      ':raised_hand: ***dingus*** :raised_back_of_hand:',
      false,
      true
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
      'If you would like to be added to this list, please message an admin.'
    ),
    RuleFactory.createReplyRule(
      ['<:cokecan:410684792263409664> <:cokecan:410684792263409664> <:cokecan:410684792263409664>'],
      '<@141365209435471872>',
      false,
      true
    ),
    RuleFactory.createReplyRule(
      ['<:pepsican:827022920160247818> <:pepsican:827022920160247818> <:pepsican:827022920160247818>'],
      '<@456527777064288256>',
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
    ),
    RuleFactory.createReplyRule(
      ['🍣🐉', '🍣 🐉'],
      '<@282606233607995392>',
      false,
      true
    )
  ];

  /** React RuleFactory rules */
  let reactRules: Rule[] = [
    RuleFactory.createReactionRule(
      ['<@295327000372051968>', '<@!295327000372051968>', '<@392409305086820352>', '<@!392409305086820352>'],
      ['👋']
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
      ['🇲', 'Ⓜ', guildService.guild.emojis.find(emoji => emoji.name === 'meseta')],
      true
    ),
    RuleFactory.createReactionRule(
      ['<@282606233607995392>'],
      ['🍣'],
      true
    )
  ];

  return [
    ...Object.values(commands),
    ...devCommands,
    ...replyRules,
    ...reactRules
  ];
}

/** Loads all modifiers into memory */
export function loadModifiers() {
  return [
    ...Object.values(modifiers)
  ];
}

// Node libs
const fs = require("fs");

// Project libs
const roleControl = require('./commands/roleControl.js');
const docs = require('./commands/docs.js');
const handleResources = require('./commands/resources.js');
const streamer = require('./commands/streamer.js');
const giveAways = require('./utils/giveAwayLib.js');
const assemble = require('./commands/assemble.js');
const commandment = require('./commands/commandment.js');
const welcome = require('./commands/welcome.js');

// Project data
const ids = require('../assets/json/ids.json');
const help = {
  all: fs.readFileSync('./src/assets/markdown/help.all.md', 'utf8'),
  ducks: fs.readFileSync('./src/assets/markdown/help.ducks.md', 'utf8'),
  admins: fs.readFileSync('./src/assets/markdown/help.admins.md', 'utf8')
};

// Project utils
const choose = require('./utils/choose.js');

// We are a ! kinda server
let prefix = '!';

/**
 * Prefixed rules all include these options, so it's easier to just create
 * a template object that we can spread onto the rules we need it in.
 */
let prefixedCommandRuleTemplate = {
  prefix: prefix,
  position: 0,
  exact: false,
  delete: true
};

/**
 * Functional utility commands
 */
let coreCommands = [
  {
    matches: ['welcome'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      welcome(msg.author);
    }
  },
  {
    matches: ['resources'],
    ...prefixedCommandRuleTemplate,
    action: handleResources
  },
  {
    matches: ['role'],
    ...prefixedCommandRuleTemplate,
    action: roleControl
  },
  {
    matches: ['help'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      let command = "all";
      
      // Determine the correct help message to deliver
      if ((msg.member) && (msg.member.roles)) {
        if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins')) {
          command = 'admins';
        } else if (msg.member.roles.find('name', 'rubber duckies')) {
          command = 'ducks';
        }
      }

      // Deliver the proper message
      switch (command) {
        case 'admins':
          msg.author.send(help.admins).catch(() => {});
        case 'ducks':
          msg.author.send(help.ducks).catch(() => {});
        case "all":
          msg.author.send(help.all).catch(() => {});
          break;
      }
    }
  },
  {
    matches: ['docs', 'doc'],
    ...prefixedCommandRuleTemplate,
    action: docs
  },
  {
    matches: ['giveaway', 'giveaways'],
    ...prefixedCommandRuleTemplate,
    action: giveAways.message
  },
  {
    matches: ['streamy', 'streamwatcher', 'letmewatchsomestreams', 'allaboardthestreamboat', 'melikeystream'],
    ...prefixedCommandRuleTemplate,
    action: streamer
  },
];

/**
 * Misc silly shit
 */
let easterEggs = [
  {
    matches: ['quackquackquack', 'assemble'],
    ...prefixedCommandRuleTemplate,
    action: assemble
  },
  {
    matches: ['toph', 'tophy', 'tophie', 'topher', 'topherlicious', 'whosyourdaddy'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send(
        choose([
          'Paging',
          'Come in',
          'Oi, where are ya',
          'Where art thou',
          'Someone needs ya',
          'You\'re presence is requested',
          'For some reason, ' + msg.author.username + ' thinks you should be here',
          msg.author.username + ' has summoned the great and all powerful'
        ]) + ' <@144913457429348352>'
      ).catch(() => {});
    }
  },
  {
    matches: ['commandment'],
    ...prefixedCommandRuleTemplate,
    action: commandment
  },
  {
    matches: ['bgmhammer'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send(':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:').catch(() => {});
    }
  },
  {
    matches: ['mm'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      msg.react('🇲')
        .then(() => msg.react('Ⓜ'))
        .catch(() => {});
    }
  },
  {
    matches: ['hmm'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      msg.react('🇭')
        .then(() => msg.react('🇲'))
        .then(() => msg.react('Ⓜ'))
        .catch(() => {});
    }
  },
  {
    matches: ['🎁 💀'],
    position: 0,
    action: msg => {
      msg.channel.send('<@277615099034730506>').catch(() => {});
    }
  },
  {
    matches: ['<@295327000372051968>'],
    action: msg => {
      msg.react('👋').catch(() => {});
    }
  }
];

// Message rules
module.exports = [
  ...coreCommands,
  ...easterEggs
];
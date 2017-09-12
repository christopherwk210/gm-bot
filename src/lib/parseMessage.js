// Node libs
const fs = require("fs");

// Project libs
const roleControl = require('./roleControl.js');
const docs = require('./commands/docs.js');
const handleResources = require('./commands/resources.js');
const streamer = require('./commands/streamer.js');
const giveAways = require('./giveAwayLib.js');
const assemble = require('./commands/assemble.js');
const cmm = require('./commands/commandment.js');

// Project data
const ids = require('../assets/json/ids.json');
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');
const help = {
  all: fs.readFileSync('./src/assets/markdown/help.all.md', 'utf8'),
  ducks: fs.readFileSync('./src/assets/markdown/help.ducks.md', 'utf8'),
  admins: fs.readFileSync('./src/assets/markdown/help.admins.md', 'utf8')
};

// Project utils
const choose = require('./utils/choose.js');
const parseCommandList = require('./utils/parseCommandList.js');

let prefix = '!';

// Message rules
rules = [
  {
    matches: ['welcome'],
    prefix: prefix,
    position: 0,
    exact: false,
    delete: true,
    action: msg => {
      msg.author.sendEmbed({
        color: 26659,
        description: welcome,
        timestamp: new Date(),
        footer: {
          text: 'This is an automated message'
        }
      }).catch(() => {});
    }
  },
  {
    matches: ['resources'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
    action: handleResources
  },
  {
    matches: ['role'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
    action: roleControl
  },
  {
    matches: ['help'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
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
          msg.author.sendMessage(help.admins).catch(() => {});
        case 'ducks':
          msg.author.sendMessage(help.ducks).catch(() => {});
        case "all":
          msg.author.sendMessage(help.all).catch(() => {});
          break;
      }
    }
  },
  {
    matches: ['docs', 'doc'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
    action: docs
  },
  {
    matches: ['giveaway', 'giveaways'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
    action: giveAways.message
  },
  {
    matches: ['streamy', 'streamwatcher', 'letmewatchsomestreams', 'allaboardthestreamboat', 'melikeystream'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
    action: streamer
  },
  // Easter egg rules
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
      msg.channel.sendMessage('<@277615099034730506>').catch(() => {});
    }
  },
  {
    matches: ['<@295327000372051968>'],
    action: msg => {
      msg.react('👋').catch(() => {});
    }
  }
];

/**
 * Handles all messages through the bot
 * @param {Message} msg The created message
 */
module.exports = function (msg) {
  // Don't respond to bots
	if (msg.author.bot) {
		return;
  }

  // Parse message for rules
  parseCommandList(rules, msg);
  
  let prefix = "!";
  let args = msg.content.split(" ");
  let command = args[0].replace(prefix, "");

  if (msg.content.startsWith(prefix)) {
    switch (command.toUpperCase()) {
      case "TOPH":
      case "TOPHY":
      case "TOPHIE":
      case "TOPHER":
      case "TOPHERLICIOUS":
      case "WHOSYOURDADDY":
        msg.channel.sendMessage(
          choose([
            'Paging',
            'Get in here',
            'Come in',
            'Oi, where are ya',
            'Where art thou',
            'You\'ve been summoned',
            'Yo',
            'Someone needs ya',
            'You\'re presence is requested',
            'For some reason, ' + msg.author.username + ' thinks you should be here',
            msg.author.username + ' has summoned the great and all powerful'
          ]) + ' <@144913457429348352>'
        ).catch(err => console.log(err));
        msg.delete();
        break;
      case "COMMANDMENT":
        cmm.run(msg, args);
        msg.delete();
        break;
      case "QUACKQUACKQUACK":
      case "ASSEMBLE":
        assemble.assemble(msg, args);
        msg.delete();
        break;
      case "BGMHAMMER":
        msg.channel.sendMessage(':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:').catch(err => console.log(err));
        msg.delete();
        break;
      default:
        return false;
        break;
    }
    return true;
  } else {
    return false;
  }
};
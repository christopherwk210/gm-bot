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

// Rules
eggs = [
  {
    matches: ['mm'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      msg.react('🇲')
        .then(msg.react('Ⓜ'));
    }
  },
  {
    matches: ['hmm'],
    exact: false,
    wholeMessage: true,
    action: msg => {
      msg.react('🇭')
        .then(msg.react('🇲'))
        .then(msg.react('Ⓜ'));
    }
  },
  {
    matches: ['🎁 💀'],
    exact: false,
    position: 0,
    action: msg => {
      msg.channel.sendMessage('<@277615099034730506>');
    }
  },
  {
    matches: ['<@295327000372051968>'],
    exact: false,
    position: -1,
    action: msg => {
      msg.react('👋');
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

  parseCommandList(eggs, msg);
  
  let prefix = "!";
  let args = msg.content.split(" ");
  let command = args[0].replace(prefix, "");

  if (msg.content.startsWith(prefix)) {
    switch (command.toUpperCase()) {
      case "WELCOME":
        msg.author.sendEmbed({
          color: 26659,
          description: welcome,
          timestamp: new Date(),
          footer: {
            text: 'This is an automated message'
          }
        }).catch(err => console.log(err));
        msg.delete();
        break;
      case "RESOURCES":
        handleResources.run(msg, args);
        msg.delete();
        break;
      case "BIRTHDAY":
        //birthday.run(msg, args);
        //msg.delete();
        break;
      case "HELP":
        let command = "all";

        if ((msg.member) && (msg.member.roles)) {
          if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins')) {
            command = 'admins';
          } else if (msg.member.roles.find('name', 'rubber duckies')) {
            command = 'ducks';
          }
        }

        switch (command) {
          case 'admins':
            msg.author.sendMessage(help.admins)
            .catch(err => console.log(err));
          case 'ducks':
            msg.author.sendMessage(help.ducks)
            .catch(err => console.log(err));
          case "all":
            msg.author.sendMessage(help.all)
            .catch(err => console.log(err));
            break;
        }
        msg.delete();
        break;
      case "ROLE":
        roleControl.control.toggleRole(msg, args.slice(1));
        msg.delete();
        break;
      case "DOC":
      case "DOCS":
        docs.control.run(msg, args);
        msg.delete();
        break;
      case "GIVEAWAY":
        giveAways.message(msg, args);
        msg.delete();
        break;
      case "STREAMWATCHER":
      case "STREAMY":
      case "LETMEWATCHSOMESTREAMS":
      case "ALLABOARDTHESTREAMBOAT":
      case "MELIKEYSTREAM":
        streamer.run(msg, args);
        msg.delete();
        break;
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
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

// We are a ! kinda server
let prefix = '!';

// Message rules
module.exports = [
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
  {
    matches: ['quackquackquack', 'assemble'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
    action: assemble
  },
  {
    matches: ['toph', 'tophy', 'tophie', 'topher', 'topherlicious', 'whosyourdaddy'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
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
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
    action: commandment
  },
  {
    matches: ['bgmhammer'],
    position: 0,
    prefix: prefix,
    exact: false,
    delete: true,
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
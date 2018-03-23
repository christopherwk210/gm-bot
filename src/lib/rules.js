// Node libs
const fs = require('fs');
const path = require('path');

// Third-party libs
const Discord = require('discord.js');

// Project libs
const roleControl = require('./commands/roleControl.js');
const docs = require('./commands/docs.js');
const handleResources = require('./commands/resources.js');
const giveAways = require('./utils/giveAwayLib.js');
const assemble = require('./commands/assemble.js');
const commandment = require('./commands/commandment.js');
const welcome = require('./commands/welcome.js');
const audio = require('./commands/audio.js');
const changeLog = require('./commands/changeLog.js');
const christmas = require('./commands/christmas.js');
const resize = require('./commands/resize.js');
const pixelchallenge = require('./commands/pixelChallenge.js');
const palette = require('./commands/palette.js');
const say = require('./commands/say.js');
const giveAwayManagement = require('./commands/giveAwayManagement.js');
const marketplace = require('./commands/marketplace.js');

// Project data
const help = {
  all: fs.readFileSync('./src/assets/markdown/help.all.md', 'utf8'),
  ducks: fs.readFileSync('./src/assets/markdown/help.ducks.md', 'utf8'),
  ducksContinued: fs.readFileSync('./src/assets/markdown/help.ducks.cont.md', 'utf8'),
  admins: fs.readFileSync('./src/assets/markdown/help.admins.md', 'utf8')
};

// Project utils
const choose = require('./utils/choose.js');
const detectStaff = require('./utils/detectStaff.js');

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
      let command;
      
      // Determine the correct help message to deliver
      if ((msg.member)) {
        command = detectStaff(msg.member);
      }

      // Deliver the proper message
      switch (command) {
        case 'admin':
          msg.author.send(help.admins).catch(() => {});
        case 'art':
        case 'rubber':
          msg.author.send(help.ducks).catch(() => {});
          msg.author.send(help.ducksContinued).catch(() => {});
        default:
          msg.author.send(help.all).catch(() => {});
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
    matches: ['3d'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      roleControl(msg, ['3d', '3D']);
    }
  },
  {
    matches: ['changelog'],
    ...prefixedCommandRuleTemplate,
    action: changeLog
  },
  {
    matches: ['resize', 'upscale', 'upsize'],
    ...prefixedCommandRuleTemplate,
    action: resize
  },
  {
    matches: ['pixelchallenge'],
    ...prefixedCommandRuleTemplate,
    action: pixelchallenge,
    delete: false
  },
  {
    matches: ['lospec', 'palettes', 'palette-list'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send('Here\'s a list of useful palettes:\nhttps://lospec.com/palette-list').catch(() => {});
    }
  },
  {
    matches: ['mp', 'marketplace'],
    ...prefixedCommandRuleTemplate,
    action: marketplace
  }
];

/**
 * Admin only commands
 */
let adminCommands = [
  {
    matches: ['say'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member) === 'admin',
    action: say
  },
  {
    matches: ['gaa'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member) === 'admin',
    action: giveAwayManagement
  }
]

/**
 * Voice channel related commands
 */
let audioCommands = [
  {
    matches: ['play'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: audio.play
  },
  {
    matches: ['resume'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: audio.resume
  },
  {
    matches: ['pause'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: audio.pause
  },
  {
    matches: ['skip'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: audio.skip
  },
  {
    matches: ['queue'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: audio.getQueue
  },
  {
    matches: ['volume'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: audio.setVolume
  },
  {
    matches: ['kick'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: audio.stop
  }
];

/**
 * Misc silly shit
 */
let easterEggs = [
  {
    matches: ['christmascycle'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: msg => christmas.cycle(msg)
  },
  {
    matches: ['christmasautocycle'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
    action: msg => christmas.autoCycle(msg)
  },
  {
    matches: ['lifetime'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      if (msg.member) {
        msg.channel.send(`${msg.member.displayName}, you have been a member of this server since ${msg.member.joinedAt}.`);
      } else {
        msg.channel.send('You can only use this in the /r/GameMaker server.');
      }
    }
  },
  {
    matches: ['quackquackquack', 'assemble'],
    ...prefixedCommandRuleTemplate,
    pre: msg => detectStaff(msg.member),
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
          'Your presence is requested',
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
    matches: ['rtfm'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      commandment(msg, ['rtfm', 'I']);
    }
  },
  {
    matches: ['bgmhammer'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send(':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:').catch(() => {});
    }
  },
  {
    matches: ['dinguses'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send(':raised_hand: ***dinguses*** :raised_back_of_hand:');
    }
  },
  {
    matches: ['dingus'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send(':raised_hand: ***dingus*** :raised_back_of_hand:');
    }
  },
  {
    matches: ['givesidadonut'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send(':doughnut:').catch(() => {});
    }
  },
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
    matches: ['<@295327000372051968>'],
    action: msg => {
      msg.react('👋').catch(() => {});
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
    matches: ['1⃣ 3⃣'],
    position: 0,
    action: msg => {
      msg.channel.send('<@121017818778042368>').catch(() => {});
    }
  },
  {
    matches: ['inversekinematics'],
    ...prefixedCommandRuleTemplate,
    action: msg => {
      msg.channel.send('<@227032791013916672>').catch(() => {});
    }
  },
  {
    matches: ['~kissfromarose~'],
    exact: false,
    wholeMessage: true,
    delete: true,
    action: msg => {
      msg.channel.send({
        file: new Discord.Attachment( path.join(__dirname, '../assets/images/kissfromarose.gif') ),
        name: 'kiss-from-a-rose.gif'
      });
    }
  },
  {
    // Because no one knows how to spell palette
    matches: ['palette', 'pallete', 'palete'],
    ...prefixedCommandRuleTemplate,
    action: palette
  }
];

// Message rules
module.exports = [
  ...coreCommands,
  ...adminCommands,
  ...audioCommands,
  ...easterEggs
];

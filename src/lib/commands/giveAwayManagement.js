// Project libs
const giveAways = require('../utils/giveAwayLib.js');

/**
 * Allows giveaway management from within Discord
 * @param {*} msg 
 * @param {Array<string>} args 
 */
module.exports = function(msg, args) {
  if (args.length < 2) {
    sendGiveAwayList(msg);
  } else {
    switch (arg[1]) {
      case '-q':
        quickCreate(msg, arg[2], arg[3]);
        break;
      default:
        sendGiveAwayList(msg);
        break;
    }
  }
}

/**
 * Quickly creates a giveaway that starts immediately and ends in one year
 * @param {*} msg 
 * @param {string} name 
 */
function quickCreate(msg, name, days) {
  if (!name) {
    msg.author.send('You need to supply a name dude. Something like: `!gaa -q myCoolGiveaway 2`');
  } else if (!days) {
    msg.author.send('You need to supply a length dude. Something like: `!gaa -q myCoolGiveaway 2`');    
  } else {
    let now = new Date();
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();
    let later = new Date(year, month, day + days);

    let res = giveAways.create(name, now / 1000, later / 1000);

    if (res) {
      giveAways.getGiveAways().some(giveAway => {
        if (giveAway.giveAway === name) {
          msg.channel.send('Ayyyy success :thumbsup:\n' + formatGiveawayStats(giveAway));
          return true;
        }
      });
    } else {
      msg.channel.send('A giveaway with that name already exists.');
    }
  }
}

/**
 * Replies to a message with an organized list of current giveaways
 * @param {*} msg 
 */
function sendGiveAwayList(msg) {
  let currentGiveaways = giveAways.getGiveAways();

  let giveAwayList = 'Current giveaways:\n\n';
  currentGiveaways.forEach(giveAway => {
    giveAwayList += formatGiveawayStats(giveAway);
  });

  msg.channel.send(giveAwayList);
}

/**
 * Formats a string with stats about a giveaway
 * @param {*} giveAway 
 */
function formatGiveawayStats(giveAway) {
  let stats = '';
  stats += '```\n';
  stats += 'Name: ' + giveAway.giveAway + '\n';
  stats += 'Start: ' + new Date(giveAway.start * 1000).toString() + '\n';
  stats += 'End: ' + new Date(giveAway.end * 1000).toString() + '\n';
  stats += 'Number of participants: ' + giveAway.participants.length + '\n';
  stats += '```\n';
  return stats;
}

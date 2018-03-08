// Project libs
const giveAways = require('../utils/giveAwayLib.js');

/**
 * Allows giveaway management from within Discord
 * @param {*} msg 
 * @param {Array<string>} args 
 */
module.exports = function(msg, args) {
  if (args.length < 2) {
    let currentGiveaways = giveAways.getGiveAways();

    let giveAwayList = 'Current giveaways:\n\n';
    currentGiveaways.array.forEach(giveAway => {
      giveAwayList += '```';
      giveAwayList += 'Name: ' + giveAway.giveAway + '\n';
      giveAwayList += 'Start: ' + new Date(giveAway.start * 1000).toString() + '\n';
      giveAwayList += 'End: ' + new Date(giveAway.end * 1000).toString() + '\n';
      giveAwayList += 'Number of participants: ' + giveAway.participants.length + '\n';
      giveAwayList += '```';
    });

    msg.channel.send(giveAwayList);
  }
}

/*
     - logs voice channel movement on a per user basis
     - excludes self mutes + self deaf
     - actions include [swap,left,joined,dead,undeaf,mute,unmute] << where mute/deaf => server mute/deaf
     - all lines with 'debug' can be commented our or deleted in live code
     !!! The first time a client joins voice since the bot went online the API will return 'undefined' for selfMute/selfDeaf - for each client.
     !!! If said client leaves and rejoins voice at any time (assuming the bot is still running) - the API will return 'false for selfMute/selfDeaf.
     !!! Too properly handle this error the extra lines in the if-statement are needed. the 'om'-map is not 'undefined' and data can be read from it.        
        code by ariak
*/

/**
 * Manage voice tracking (Use in voiceStatusUpdate)
 * @param {*} om Old member
 * @param {*} nm New member
 * @param {*} db Database reference
 */
module.exports = function(om, nm, db) {
  // console.log('voice event :' + om.selfMute + ":" + nm.selfMute + ':' + om.selfDeaf + ':' + nm.selfDeaf);   // debug: strange om.selfMute / Deaf behaviour
  if (!(om.selfMute !== nm.selfMute || om.selfDeaf !== nm.selfDeaf) || // exclude selfmute/death - read as 'dont act upon changes'
    typeof(om.selfMute) === 'undefined' || typeof(om.selfDeaf) === 'undefined' ) {  // see Note '!!!' 

    // Action and Channel
    let action = '';
    let channel = '';
    let checked = 0;

    if (om.voiceChannel) {
      checked += 1; // used for the switch case
    }
    if (nm.voiceChannel) {
      checked += 2;
    }

    switch(checked) {
      case 1: action = 'left';    channel = om.voiceChannel.name; break;
      case 2: action = 'joined';  channel = nm.voiceChannel.name; break;
      case 3: action = 'swap';    channel = nm.voiceChannel.name; break;
      default: console.log('unexpected error - neither current not previous channel defined'); break;
    }

    // attempt to override action: 'swap' if serverMute/serverDeaf event triggered
    if (om.serverDeaf !== nm.serverDeaf) { 
      action = nm.serverDeaf ? 'deaf' : 'undeaf';
    } else if (om.serverMute !== nm.serverMute) {  // mute event
      action = nm.serverMute ? 'muted' : 'unmuted';
    }

    let dataBlob = {
      timestamp: Date.now(),
      event: 'voice',
      action: action,
      channel: channel,
      user: om.user.username,
      displayName: om.displayName,
      mute: nm.serverMute,
      deaf: nm.serverDeaf
    }

    db.voip.insert(dataBlob, function(err) {
      if (err) {
        console.log('Voip log could not save to database.');
      } else {
        console.log('Voip stat successfully logged.');
      }
    });
  }
};

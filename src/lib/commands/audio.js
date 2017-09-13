// Store the current connection
let currentConnection;

/**
 * Plays music
 * @param {Message} msg Discord message
 */
function play(msg) {
  if (validateVoiceConnection(msg)) {
    msg.member.voiceChannel.join().then(connection => {
      currentConnection = connection;
    }).catch(() => {});
  }
}

/**
 * Stops playing music and disconnects
 * @param {Message} msg Discord message
 */
function stop(msg) {
  if (validateVoiceConnection(msg)) {
    currentConnection.disconnect();
    currentConnection = undefined;
  }
}

/**
 * Validates that a user is in a guild voice channel
 * @param {Message} msg Discord message
 */
function validateVoiceConnection(msg) {
  if ((msg.member) && (msg.member.voiceChannel)) {
    return true;
  } else {
    msg.author.send('You must be in a voice channel in /r/GameMaker to do that!');
    return false;
  }
}

// Export
module.exports = {
  play: play,
  stop: stop
};
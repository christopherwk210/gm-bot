// Third-Party libs
const youtubedl = require('youtube-dl');

// Project utils
const choose = require('../utils/choose.js');

// Store the current connection
let currentConnection;

// Store the current dispatcher
let dispatch;

// Music queue
let queue = [];

// Stream volume
let volume = 100;

/**
 * Plays audio!
 * @param {Message} msg Discord message
 * @param {Array<string>} args Message args
 */
function play(msg, args) {
  if (validateVoiceConnection(msg)) {
    let options = generateOptions(args);

    let videoUrl;

    // Find the url that was passed
    args.some(arg => {
      if (arg.indexOf('http') === 0) {
        // Record it
        videoUrl = arg;

        // Short cuircut
        return true;
      }
    });

    if (videoUrl) {
      // Join the member's channel
      msg.member.voiceChannel.join().then(connection => {
        // Save the connection
        currentConnection = connection;

        // Fetch the provided url
        fetchAudio(msg, videoUrl, options);
      }).catch(() => {});
    } else {
      if (!options.silent) {
        // No song specified
        msg.author.send('You didn\'t specify a song to play, silly!');
      }
    }
  }
}

/**
 * Fetches the audio resource at the given URL
 * @param {Message} msg Discord message
 * @param {string} url Resource URL
 * @param {object} [options] Options object
 * @param {boolean} [options.silent] If true, won't send the user any messages
 */
function fetchAudio(msg, url, options) {
  // Get the resource info
  youtubedl.getInfo(url, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
    // Verify the info.
    if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
      if (!options.silent) {
        msg.author.send('Invalid URL!');      
      }
      return;
    }

    // Add to the queue
    queue.push(info);

    // If this is the only thing in the queue, play immediately
    if (queue.length === 1) {
      processQueue(msg, queue, options);
    }

    // Report status unless hushed by silent option
    if (!options.silent) {
      msg.author.send(`Queued ${info.title}`);      
    }
  });
}

/**
 * Processes the queue triggering audio playback
 * @param {Message} msg Discord message
 * @param {Array<any>} queue Audio playback queue
 * @param {object} [options] User options
 */
function processQueue(msg, _queue, options) {
  if (_queue.length < 1) {
    // No more tunes to play! Disconnect
    disconnect();
    return;
  }

  // Get the next item to play
  let nextItem = _queue[0];

  // Announce our excitement to the user
  if (!options.silent) {
    msg.author.send(`Loading: ${nextItem.title}`);
  }

  // No connection, can't play!
  if (!currentConnection) {
    if (validateVoiceConnection(msg)) {
      msg.member.voiceChannel.join().then(connection => {
        // Save the connection
        currentConnection = connection;
      }).catch(() => {});
    } else if (!options.silent) {
      msg.author.send('Can not play music when not in a channel.');
    }
    return;
  }

  // Play away
  dispatch = currentConnection.playStream(youtubedl(nextItem.url, ['-x', '--audio-quality', '0']), { volume: (volume * 0.01) / 3 });
  dispatch.setBitrate('auto');

  // On stream start
  dispatch.on('start', () => {
    // Announce our excitement to the user
    if (!options.silent) {
      msg.author.send(`Now playing: ${nextItem.title}`);
    }
  });

  // On stream error
  dispatch.on('error', () => {
    // Skip to the next song
    _queue.shift();
    processQueue(msg, _queue, {
      silent: true
    });
  });

  // On stream end
  dispatch.on('end', () => {
    // Wait a second
    setTimeout(() => {
      // Remove the song from the queue
      _queue.shift();

      // Play the next song in the queue
      processQueue(msg, _queue, {
        silent: true
      });
    }, 1000);
  });
}

/**
 * Pauses audio
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command args
 */
function pause(msg, args) {
  let options = generateOptions(args);

  // Get the voice connection.
  if (!currentConnection) {
    if (!options.silent) {
      let choice = choose(['dingus', 'silly', 'goofball', 'knuckle head', 'jack wagon']);
      msg.author.send(`No music is playing ya ${choice}!`);
    }
    return;
  }

  // Alert the guy on pausing duty
  if (!options.silent) {
    msg.author.send('Paused');
  }

  // Pause
  dispatch.pause();
}

/**
 * Resumes playback
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command args
 */
function resume(msg, args) {
  let options = generateOptions(args);

  // Get the voice connection.
  if (!currentConnection) {
    if (!options.silent) {
      let choice = choose(['dingus', 'silly', 'goofball', 'knuckle head', 'jack wagon']);
      msg.author.send(`I'm not connected ya ${choice}!`);
    }
    return;
  }

  // Resume if needed
  if (dispatch.paused) {
    dispatch.resume();
  }
}

/**
 * Skips message
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command args
 */
function skip(msg, args) {
  let options = generateOptions(args);

  // Get the voice connection.
  if (!currentConnection) {
    if (!options.silent) {
      let choice = choose(['dingus', 'silly', 'goofball', 'knuckle head', 'jack wagon']);
      msg.author.send(`No music is playing ya ${choice}!`);
    }
    return;
  }

  dispatch.end();
}

/**
 * Sends the user the current queue
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command args
 */
function getQueue(msg) {
  if (queue.length < 1) {
    msg.author.send('Queue is empty!');
    return;
  }

  // Set up a stringydoo
  let currentQueueMessage = 'Current playback queue:\n';

  // Iterate over the queue
  queue.forEach((item, i) => {
    currentQueueMessage += `${i}: ${item.title}\n`;
  });

  // Supply the result
  msg.author.send(currentQueueMessage);
}

/**
 * Sets the internal stream volume
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command args
 */
function setVolume(msg, args) {
  if (!args[1]) {
    msg.author.send(`Current volume: ${volume}`);
    return;
  }

  let newVol = parseFloat(args[1]);

  if (isNaN(newVol)) {
    msg.author.send('Invalid value for volume!');
    return;
  }

  volume = newVol;

  if (dispatch) {
    dispatch.setVolume((newVol * 0.01) / 3);
  }
}

/**
 * Stops playing audio and disconnects
 * @param {Message} msg Discord message
 */
function stop(msg) {
  if (validateVoiceConnection(msg)) {
    // Dump the queue
    queue.splice(0, queue.length);

    // Get off
    disconnect();
  }
}

/**
 * Returns an options object from command args
 * @param {Array<string>} args Command args
 */
function generateOptions(args) {
  let options;

  options = {
    silent: args.indexOf('s') > -1 || args.indexOf('silent') > -1
  };

  return options;
}

/**
 * Disconnects from the current voice connection
 */
function disconnect() {
  if (currentConnection) {
    // Disconnect from voice
    currentConnection.disconnect();
    
    // Reset current connection state
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
    // You silly!
    msg.author.send('You must be in a voice channel in /r/GameMaker to do that!');
    return false;
  }
}

// Export
module.exports = {
  play: play,
  pause: pause,
  resume: resume,
  skip: skip,
  stop: stop,
  getQueue: getQueue,
  setVolume: setVolume
};

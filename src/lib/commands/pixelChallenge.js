// Node libs
const async = require('async');
const path = require('path');
const fs = require('fs');
const util = require('util');
let imgur = require('../third-party/imgur');

let existsAsync = util.promisify(fs.exists);

// Project imports
const detectStaff = require('../utils/detectStaff.js');

// Challenges data file location
let challengesDataPath = path.join(__dirname, '../../data/pixelChallenges.json');

// Holds current pixel challenge entries
let currentPixelChallenge = {
  entries: []
};

// Create async queue to save pixel entries
let queue = async.queue((task, callback) => {
  fs.unlink(challengesDataPath, () => {
    fs.writeFile(challengesDataPath, JSON.stringify(currentPixelChallenge), 'utf8', () => {
      callback();
    });
  });
}, 1);

/**
 * Loads existing entries if they exist
 */ 
async function loadEntries() {
  let existingChallenges = await existsAsync(challengesDataPath);

  if (existingChallenges) {
    currentPixelChallenge = require(challengesDataPath);
  }
}

// Load entries
loadEntries();

/**
 * Handles pixel challenge entries
 */
function pixelChallenge(msg, args) {

  if (!msg.member) {
    msg.channel.send('You can only do that in the /r/GameMaker Discord Server, you silly!');
    return;
  }

  if (detectStaff(msg.member)) {

    // List all entries
    if (args.length > 1 && args[1] === '-list') {
      msg.author.send('Here are the current pixel challenge entries:').then(() => {
        if (currentPixelChallenge.entries.length > 0) {
          currentPixelChallenge.entries.forEach(entry => {
            msg.author.send(`**User:** ${entry.name}, **Message:** ${(entry.text || '(no text provided)')}, **Entry:** ${entry.link}`);
          });
        } else {
          msg.author.send('loljk there are no entries yet, sorry dude');
        }
      });
      msg.delete();
      return;
    } else if (args.length > 1 && args[1] === '-clear') {

      // Clear all entries
      msg.author.send('The entries have been cleared! Here are entries you cleared, one last time:').then(() => {
        if (currentPixelChallenge.entries.length > 0) {
          currentPixelChallenge.entries.forEach(entry => {
            msg.author.send(`**User:** ${entry.name}, **Entry:** ${entry.link}`);
          });
          currentPixelChallenge.entries = [];
        } else {
          msg.author.send('Actually, there were no entries to clear. You cleared nothing. It was a waste of time.');
        }
      });

      queue.push({}, () => {});

      msg.delete();
      return;
    } else if (args.length > 1 && args[1] === '-imgur') {
      if (currentPixelChallenge.entries.length > 0) {
        createImgurAlbum(msg);
      } else {
        msg.author.send('No entries yet! Skipping imgur upload.');
      }
      return;
    }
  }

  // Get all message attachments
  let attachments = Array.from(msg.attachments.values());

  // Ensure an attachment exists
  if (!attachments.length) {
    msg.channel.send('Invalid command usage! You must upload an image with your message when using the pixel challenge command.');
    return;
  }

  let found = false;

  // Check if this user already has an entry
  currentPixelChallenge.entries.forEach(entry => {
    if (entry.name === msg.author.username) {
      found = true;
      
      // Take first image
      entry.link = attachments[0].url;

      // Update text
      entry.text = msg.content;

      msg.channel.send(`Updated existing entry for ${msg.author.username}.`);

      queue.push({}, () => {});
    }
  });

  // Append if not found
  if (!found) {
    currentPixelChallenge.entries.push({
      name: msg.author.username,
      text: msg.content,
      link: attachments[0].url
    });

    msg.channel.send(`Challenge entry for ${msg.author.username} recorded.`);

    queue.push({}, () => {});
  }
}

async function createImgurAlbum(msg) {
  let album, msgRef;

  try {
    msgRef = await msg.author.send('Creating album, please wait...');
  } catch(e) {
    console.log(e);
    return;
  }

  try {
    album = await imgur.createAlbum();
  } catch(e) {
    msgRef.edit('Something went wrong when contacting the imgur api... :(');
    return;
  }

  console.log('Created imgur album', album);

  for (let entry of currentPixelChallenge.entries) {
    try {
      await imgur.uploadUrl(entry.link, album.data.deletehash, entry.name, entry.text);
    } catch(e) {
      msgRef.edit('Something went wrong when contacting the imgur api... :(');
      return;
    }
  }

  msgRef.edit(`Uploads complete. View album here: https://imgur.com/a/${album.data.id}.`);
}

module.exports = pixelChallenge;

// Node libs
import fs = require('fs');
import path = require('path');
import { Message } from 'discord.js';
const async = require('async');

// Init
let data = {}
let filePath = path.join(__dirname, '../../../data/giveAwaysData.json');

// Create async queue to save data
let queue = async.queue((task, callback) => {
  fs.unlink(filePath, () => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', () => {
      callback();
    });
  });
}, 1);

/**
 * Triggers a file save by appending to the async queue
 */
function saveData() {
  queue.push({}, () => {});
}

// Load existing data or create it, if not present
if (fs.existsSync(filePath)) {
  data = require('../../../data/giveAwaysData.json');
} else {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Handles a Discord message containing the giveaway command
 * @param msg 
 * @param args 
 */
export function handleGiveawayMessage(msg: Message, args: string[]) {
  let activeGAs = Object.keys(data);
  let activeGACount = activeGAs.length;

  switch(activeGACount) {
    case 0:
      replyError(msg, 'There are no currently active giveaways!');
      break;
    case 1:
      // Default to signing up for the first giveaway
      signup(msg, activeGAs[0]);
      break;
    default:
      // Send list of giveaways if none specified when multiple exist
      if (args.length === 1) {
        replyList(msg)
      } else {
        // Otherwise, try to signup for the one specified
        signup(msg, args[1]);
      }
      break;
  }
}

/**
 * Draw winner!
 * @param name 
 * @param count 
 */
export function drawGiveawayWinner(name: string, count: any) {
  if (data[name] === undefined) {
    console.log(`Giveaway ${name} doesn't exist, could not draw winner.`);
    return false;
  }

  if (data[name].participants.length === 0) {
    console.log(`Giveaway ${name} has no entries, could not draw winner.`);
    return false;
  }

  let realParticipants = data[name].realParticipants;
  let numberOfParticipants = realParticipants.length;
  let winners = data[name].winners;

  let minCount = Math.min(numberOfParticipants, count);

  let i = 0;
  while (i < minCount) {
    // Determine winner
    let winnerIndex = Math.trunc(Math.random() * numberOfParticipants);

    // Push 'em in
    winners.push({
      userID: realParticipants[winnerIndex].userID,
      userName: realParticipants[winnerIndex].userName
    });

    // Slide 'em out
    realParticipants.slice(winnerIndex, 1);
    data[name].participants.splice(winnerIndex, 1);

    numberOfParticipants--;
    i++;
  }

  // Save changes
  saveData();

  // Give back updated winners
  return winners;
}

/**
 * Sign up a user for a giveaway
 * @param msg 
 * @param name Giveaway name
 */
function signup(msg: Message, name: string) {
  let err;
  let now = Date.now() / 1000;
  let giveaway = data[name];
  let userID = msg.author.id;

  // Check for errors
  if (giveaway === undefined) {
    err = `A giveaway for ${name} doesn't exist!`;
  } else if (now < parseInt(giveaway.start)) {
    err = `The ${name} giveaway hasn't opened for signups yet!`;
  } else if (now > parseInt(giveaway.end)) {
    err = `The ${name} giveaway signup period has concluded!`;
  } else if (giveaway.participants.indexOf(userID) !== -1) {
    err = 'No duplicate entries!';
  }

  if (err) {
    replyError(msg, err);
    return false;
  }

  // Add user to giveaway
  giveaway.participants.push(userID);
  giveaway.realParticipants.push({
    userID,
    userName: msg.author.username
  });
  msg.author.send(`Thank you for signing up for the ${name} giveaway!`).catch(() => {});

  // Save to file
  saveData();

  return true;
}

/**
 * Create giveaway
 * @param name 
 * @param {*} start 
 * @param {*} end 
 */
export function createGiveaway(name: string, start, end) {
  if (data[name]) {
    console.log(`Giveaway ${name} already exists! Could not create giveaway.`);
    return false;
  }

  data[name] = {
    start,
    end,
    participants: [],
    realParticipants: [],
    winners: []
  };

  saveData();

  return true;
}

/**
 * Deletes an existing giveaway
 * @param name 
 */
export function deleteGiveaway(name: string) {
  if (data[name]) {
    delete data[name];
    saveData();
    console.log(`Giveaway ${name} deleted.`);
  }
}

/**
 * Returns all active giveaways
 */
export function getGiveAways() {
  let valid = [];

  for (let g in data) {
    if (data.hasOwnProperty(g)) {
      valid.push({
        giveAway: g,
        start: data[g].start,
        end: data[g].end,
        participants: data[g].participants,
        realParticipants: data[g].realParticipants,
        winners: data[g].winners
      });
    }
  }

  return valid;
}

/**
 * Reply to a message with a list of all giveaways
 * @param msg 
 */
function replyList(msg: Message) {
  let valid = '';

  for (let g in data) {
    if (data.hasOwnProperty(g)) {
      valid += `${g}, `;
    }
  }

  // Remove last comma and space
  valid = valid.substr(0, valid.length - 2);

  let reply = `Here is a list of valid giveaways: ${valid}.\nType \`!giveaway <name>\` to sign up for one!`;
  msg.channel.send(reply);
}

/**
 * Reply to a message as a signup error
 * @param msg 
 * @param errMsg 
 */
function replyError(msg: Message, errMsg: string) {
  msg.author.send(`Signup Error: ${errMsg}`).catch(() => {});
}

/*
  Lib for give aways on the GameMaker Discord
   - code by ariak

  TODO
  - in parse only show multiple if multiple truly active! (date comparison)
  - include raffle signup date check (done in theory - code commented out)
  - complete draw function (currently returns ID);
*/

// Requires Libraries
const fs = require('fs');

let data;
let fpath = './src/data/giveAwaysData.json';

// Create giveAway json if it doesn't exists
fs.open(fpath, 'r', function(fileErr) {
  if (fileErr !== undefined) {
    fs.writeFile(fpath, '{}', function(err) {
      if (err) {
        console.log(err);
      } else {
        data = require('../../data/giveAwaysData.json');
      }
    });
  } else {
    data = require('../../data/giveAwaysData.json');
  }
});

let lib = {
  loadJson: function(giveaway) {
    let parsedGiveaway = JSON.parse(giveaway);

    data[parsedGiveaway.giveAway] = {
      start: parsedGiveaway.start,
      end: parsedGiveaway.end,
      participants: parsedGiveaway.participants,
      realParticipants: parsedGiveaway.realParticipants,
      winners: parsedGiveaway.winners
    }
  },
  message: function(msg, command) {
    let activeGAs = Object.keys(data);
    let activeGACount = activeGAs.length;

    if (activeGACount === 0) {
      lib.reply_error(msg,'no currently active giveaways.')
    } else if (activeGACount === 1) {
      lib.signup(msg,activeGAs[0]);                   // default to first and only GA
    } else {                                          // if multiple GA:
      if (command.length === 1) {
        lib.reply_list(msg);  // IF only one argument provided - send GA list
      } else {
        lib.signup(msg,command[1]); // ELSE attempt sign up with provided command
      }
    }
  },
  signup: function(msg,name) { // message and giveaway name to sign up for! - WARNING CALLS DRAW FNCT TO DEBUG
    let errMsg = 0;
    let tnow = Date.now() / 1000;
    let ga = data[name];
    let userID = msg.author.id;

    // Logic Checks
    if (ga === undefined) { 
      errMsg = 'a giveaway for ' + name + ' doesn\'t exist!';
    } else if (tnow < parseInt(ga.start))  {
      errMsg = 'the ' + name + ' giveaway hasn\'t opened for signups yet!'
    } else if (tnow > parseInt(ga.end)) {
      errMsg = 'the ' + name + ' giveaway signup period has concluded!'
    } else if (ga.participants.indexOf(userID) !== -1) {
      errMsg = 'no duplicate entries!';
    }

    if (errMsg !== 0) {
      lib.reply_error(msg,errMsg);

      return false;
    }

    // All checks passed: append and update file
    ga.participants.push(userID);
    ga.realParticipants.push({
      userID: userID,
      userName: msg.author.username
    });
    lib.reply_success(msg,name);
    lib.pushDB();

    return true;
  },
  draw: function(name, count) {     // draw a give away winner
    let errMsg;

    if (data[name] === undefined) {
      errMsg = 'GA doesnt exist';
      console.log('[GA] Drawing Error: ' + errMsg);

      return false;
    }
    if (data[name].participants.length === 0) { // check length after purge
      errMsg = 'GA has no participants';
      console.log('[GA] Drawing Error: ' + errMsg);

      return false;
    }
    
    // determine all winners
    let p = data[name].realParticipants;
    let l = p.length;
    let w = data[name].winners;

    let minCount = Math.min(p.length, count);       // may not excede l;

    let i = 0;
    while (i < minCount) {               
      let r = Math.trunc(Math.random() * l);  // determine winner index
      w.push({
        userID: p[r].userID,
        userName: p[r].userName
      });                         // push to winners
      p.splice(r,1);                        // remove winner for further draws
      data[name].participants.splice(r,1);                        // remove winner for further draws
      --l;
      ++i;
    }
    console.log('winners: ' + w);
    lib.pushDB();

    return w;                                 // returns list of winner user.id's     
  },
  create: function(name,start,end) {           // Create a new give away! +++ start,end as unix +++
    if (data[name] !== undefined) {
      console.log('[GA] GA with this name already exists');

      return false; // report error to express API
    }
    // checks passed: create entry, push JSON/DB
    data[name] = {
      start: start,
      end: end,
      participants: [],
      realParticipants: [],
      winners: []
    }
    lib.pushDB();

    return true; // report success to express API
  },
  delete: function(name) {                     // attempt to delete a give away!
    if (data[name] !== undefined) {
      delete data[name];
      lib.pushDB();
      console.log('[GA] deleted ' + name);
    }
  },
  blacklist_purge: function(list,blacklist) {
    if (list.constructor !== Array || blacklist.constructor !== Array) {
      return list; // ignore error
    }
    let returnList = list.filter(function(e) {
        return this.indexOf(e) < 0; // this ==> blacklist
    }, blacklist);
    console.log('[GA] Blacklist filtered ' + ((list.length) - (returnList.length)) + ' Element/s');

    return returnList;
  },
  reply_error: function(msg,errMsg) {
    let reply = 'Signup Error: ' + errMsg;
    msg.author.send(reply)
      .then(() => console.log('[GA] Error sent to User: ' + msg.author.username + ', userID: ' + msg.author.id + ', Error: ' + errMsg))
      .catch(console.error);
  },
  reply_success: function(msg,selectedGA) {
    let reply = 'Thank you for signing up for the ' + selectedGA + ' giveaway.';
    msg.author.send(reply).catch(() => {});
  },
  reply_list: function(msg) {
    let valid = '';
    for (let g in data) {
      if (data.hasOwnProperty(g)) {
        valid += g + ', ';
      }
    }
    valid = valid.substr(0, valid.length - 2); // remove last two charcters ', ';
    let reply = 'Here is a list of valid giveaways: ' + valid + '.\nType `!giveaway <name>` to sign up.';
    msg.channel.send(reply);
  },
  getGiveAways: function() {
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
  },
  pushDB: function() {                       // internal async push to DB or JSON
    fs.writeFileSync(fpath, JSON.stringify(data));
  }
}
module.exports = lib;

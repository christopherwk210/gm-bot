/*
  Lib for give aways on the GameMaker Discord
   - code by ariak

  TODO
  - in parse only show multiple if multiple truly active! (date comparison)
  - include raffle signup date check (done in theory - code commented out)
  - complete draw function (currently returns ID);
*/

// Requires Libraries
const fs = require('fs'),
      serverName = '/r/GameMaker';

let data;
let db;

let lib = {
  init: function(database) {
    db = database;
    db.giveAway.find({}, function(err, docs) {
      if (err !== null) {
        console.log(err);
      } else {
        // console.log(docs);
        data = docs;
      }
    });
  },
  message: function(msg, command) {
    let activeGAs = Object.keys(data),
        activeGACount = activeGAs.length;
    if (activeGACount === 0){
      lib.reply_error(msg,'no currently active giveaways')
    } else if (activeGACount === 1){
      lib.signup(msg,activeGAs[0]);                   // default to first and only GA
    } else {                                          // if multiple GA:
      if (command.length === 1) lib.reply_list(msg);  // IF only one argument provided - send GA list
      else lib.signup(msg,command[1]);                // ELSE attempt sign up with provided command
    }
  },
  signup: function(msg,name) {                 // message and giveaway name to sign up for! - WARNING CALLS DRAW FNCT TO DEBUG
    let err_msg = 0,
        tnow = Date.now()/1000,
        ga = data[name],
        userID = msg.author.id,
        our_guild = msg.client.guilds.find('name',serverName); // returns our guild, OR undefined if not author is not part of it!
        //there might be smarter ways to grab "our guild" - eg passing the constant from the bot client once!
    
    // Logic Checks
    if      (ga === undefined)              err_msg = "giveaway " + name + " doesn't exist";
    //else if (ga.start > tnow)               err_msg = "giveaway " + name + " will open for signups at " + moment.unix(ga.start).format('LLL');
    //else if (ga.end < tnow)                 err_msg = "giveaway " + name + " sign up period has concluded as of" + moment.unix(ga.end).format('LLL');
    else if (our_guild === undefined)       err_msg = 'Give aways on r/discord are only for members!'; // OVERKILL - PART OF GMBOT MSG PARSING
    else if (ga.participants.indexOf(userID) !== -1) err_msg = 'no duplicate entries'
    //else if (our_guild.member(msg.author).highestRole.name === 'Admin') err_msg = '_Jon stares at you disapprovingly_';

    if (err_msg !== 0) {
      lib.reply_error(msg,err_msg);
      return false;
    }

    // All checks passed: append and update file
    ga.participants.push(userID);
    lib.reply_success(msg,name);
    lib.pushDB();
    lib.draw(name,1,[userID]); // DEBUG ONLY!
    return true;
  },
  draw: function(name, count, blacklist) {     // draw a give away winner
    if (data[name] === undefined){
      err_msg = "GA doesnt exist";
      console.log('[GA] Drawing Error: ' + err_msg);
      return false;
    }
    data[name].participants = lib.blacklist_purge(data[name].participants, blacklist);
    if (data[name].participants.length === 0) { // check length after purge
      err_msg = "GA has no participants";
      console.log('[GA] Drawing Error: ' + err_msg);
      return false;
    }
    
    // determine all winners
    let p = data[name].participants,
        l = p.length,
        w = data[name].winners;
    count = Math.min([p.length,count]);       // may not excede l;

    let i=0; while (i < count){               // ariak special loop
        let r = Math.trunc(Math.random()*l);  // determine winner index
        w.push(p[r]);                         // push to winners
        p.splice(r,1);                        // remove winner for further draws
        --l;
    ++i}
    console.log('winners: '+ w);
    lib.pushDB();
    return w;                                 // returns list of winner user.id's     
  },
  create: function(name,start,end){           // Create a new give away! +++ start,end as unix +++
    if (data[name] !== undefined){
      console.log('[GA] GA with this name already exists');
      return false; // report error to express API
    }
    // checks passed: create entry, push JSON/DB
    data[name] = {
      start: start,
      end: end,
      participants: [],
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
  blacklist_purge: function(list,blacklist){
    if (list.constructor !== Array || blacklist.constructor !== Array) return list; // ignore error
    let returnList = list.filter(function(e){
        return this.indexOf(e) < 0; // this ==> blacklist
    }, blacklist);
    console.log('[GA] Blacklist filtered ' + ((list.length) - (returnList.length)) + ' Element/s');
    return returnList;
  },
  reply_error: function(msg,err_msg){
    let reply = 'GiveAway Signup Error: '+err_msg;
    msg.author.sendMessage(reply)
      .then(message => console.log('[GA] Error sent to User: '+ msg.author.username + ', userID: ' + msg.author.id + ', Error: '+ err_msg))
      .catch(console.error);
  },
  reply_success: function(msg,selectedGA){
    let reply = "Thank you for signing up for the giveaway " + selectedGA + ".";
    msg.author.sendMessage(reply)
      //.then(message => console.log('[GA] User: '+ msg.author.username + ', userID: ' + msg.author.id + ', signed up for '+ selectedGA))
      .catch(console.error);
  },
  reply_list: function(msg){
    let valid = '';
    for (let g in data) {
      if (data.hasOwnProperty(g)) {
        valid += g+', ';
      }
    }
    valid = valid.substr(0,valid.length-2); // remove last two charcters ', ';
    let reply = 'Here is a list of valid giveaways: '+ valid + '.\nType `!giveaway <name>` to sign up.';
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
          winners: data[g].winners
        });
      }
    }
    return valid;
  },
  pushDB: function() {                       // internal async push to DB or JSON
    db.giveAway.remove({}, { multi: true }, function (err, numRemoved) {
      if (err !== null) {
        db.insert(data, function (err, newDoc) {
          if (err !== null) {
            console.log('Error saving giveaway data to DB!');
          }
        });
      } else {
        console.log('Error removing old give away db: ' + err);
      }
    });
  }
}
module.exports = lib;
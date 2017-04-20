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

const moment = require('moment');

let data;
let fpath = './src/data/giveAwaysData.json';

// Create giveAway json if it doesn't exists
fs.open(fpath,'r',function(err, fd){
	if (err) {
		fs.writeFile(fpath, '{}', function(err) {
			if(err) {
				console.log(err);
			}
      data = require('../data/giveAwaysData.json');
		});
	} else {
    data = require('../data/giveAwaysData.json');
	}
});

let lib = {
  message: function(msg, command) {
    let activeGAs = Object.keys(data),
        activeGACount = activeGAs.length;
    if (activeGACount === 0){
      lib.reply_error(msg,'no currently active giveaways.')
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
    
    console.log(ga, tnow);

    // Logic Checks
    if      (ga === undefined) {             err_msg = "a giveaway for " + name + " doesn't exist!"; }
    else if (tnow < parseInt(ga.start))  {             err_msg = "the " + name + " giveaway hasn't opened for signups yet!" }
    else if (tnow > parseInt(ga.end))    {             err_msg = "the " + name + " giveaway signup period has concluded!" }
    else if (ga.participants.indexOf(userID) !== -1) {err_msg = 'no duplicate entries!';}
    else if (our_guild.member(msg.author).highestRole.name === 'admins') {err_msg = '_Jon stares at you disapprovingly_';}

    if (err_msg !== 0) {
      lib.reply_error(msg,err_msg);
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
  draw: function(name, count, blacklist) {     // draw a give away winner
    if (data[name] === undefined){
      err_msg = "GA doesnt exist";
      console.log('[GA] Drawing Error: ' + err_msg);
      return false;
    }
    // data[name].participants = lib.blacklist_purge(data[name].participants, blacklist);
    if (data[name].participants.length === 0) { // check length after purge
      err_msg = "GA has no participants";
      console.log('[GA] Drawing Error: ' + err_msg);
      return false;
    }
    
    // determine all winners
    let p = data[name].realParticipants,
        l = p.length,
        w = data[name].winners;
    count = Math.min(p.length,count);       // may not excede l;

    let i=0; while (i < count){               // ariak special loop
        let r = Math.trunc(Math.random()*l);  // determine winner index
        console.log(r, p[r])
        w.push({
          userID: p[r].userID,
          userName: p[r].userName
        });                         // push to winners
        p.splice(r,1);                        // remove winner for further draws
        data[name].participants.splice(r,1);                        // remove winner for further draws
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
  blacklist_purge: function(list,blacklist){
    if (list.constructor !== Array || blacklist.constructor !== Array) return list; // ignore error
    let returnList = list.filter(function(e){
        return this.indexOf(e) < 0; // this ==> blacklist
    }, blacklist);
    console.log('[GA] Blacklist filtered ' + ((list.length) - (returnList.length)) + ' Element/s');
    return returnList;
  },
  reply_error: function(msg,err_msg){
    let reply = 'Signup Error: '+err_msg;
    msg.author.sendMessage(reply)
      .then(message => console.log('[GA] Error sent to User: '+ msg.author.username + ', userID: ' + msg.author.id + ', Error: '+ err_msg))
      .catch(console.error);
  },
  reply_success: function(msg,selectedGA){
    let reply = "Thank you for signing up for the " + selectedGA + " giveaway.";
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
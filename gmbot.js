// Init discord api
const Discord = require('discord.js');
const bot = new Discord.Client();

// Node libs
const fs = require("fs");

// Database setup
const Datastore = require('nedb');
let db = {};

// Admin db
db.admins = new Datastore({
	filename:'./src/data/admins.db',
	autoload: true,
	onload: function() {
		// Auto compact every 12 hours
		db.admins.persistence.setAutocompactionInterval(3600000 * 24);
	}
});

// Voip log db
db.voip = new Datastore({
	filename:'./src/data/voip.db',
	autoload: true,
	onload: function() {
		// Auto compact every 4 hours
		db.voip.persistence.setAutocompactionInterval(3600000 * 12);
	}
});

// Profile log db
db.profile = new Datastore({
	filename:'./src/data/profile.db',
	autoload: true,
	onload: function() {
		// Auto compact every 4 hours
		db.voip.persistence.setAutocompactionInterval(3600000 * 24);
	}
});

// Project libs
const detectRole = require('./src/lib/detectRole');
const pm = require('./src/lib/pm');
const parseMessage = require('./src/lib/parse-message');
const prettifier = require('./src/lib/prettifier');
const gmlive = require('./src/lib/gmlive');
const express = require('./src/express/express');
const adkVoice = require('./src/lib/voipUsage.js');
const adkProfile = require('./src/lib/profile.js');

// Project  data
const ids = require('./src/assets/json/ids.json');
const badlinks = require('./src/assets/json/bad-links.json');
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');

// Temp user storage
let users = [];

// Keep dm log history in memory
let dmLog = {};

// Handles image upload limitting
let imageLog = {
	timers: []
};
imageCap = 3; 							//3 images within
imageTimer = 1000 * 60 * 5 	//5 minutes

// Import authorization token
var auth;
try {
	auth = require("./src/assets/json/auth.json");
} catch (e){
	console.log("No auth.json found. Please see auth.example.json.\n"+e.stack);
	process.exit();
}

// Bot connected status
bot.on('ready', () => {
	console.log("Squaring to go, captain.");

	// Fetch net and toph
	bot.fetchUser(ids.net8floz).then(user => {
		users.push(user);
	}, err => console.log(err));

	bot.fetchUser(ids.topherlicious).then(user => {
		users.push(user);
	}, err => console.log(err));

	let guildCollection = bot.guilds.find('name','/r/GameMaker');
	adkProfile.adkProfile(guildCollection, db);
	setInterval(() => {
		adkProfile.adkProfile(guildCollection, db);
	}, 3600000);
});

// Send welcome message to new members
bot.on('guildMemberAdd', member => {
	member.sendEmbed({
		color: 26659,
		description: welcome,
		timestamp: new Date(),
		footer: {
			text: 'This is an automated message'
		}
	}).catch(err => console.log(err));
});

// Automatically add voip_text role to users who join voip
bot.on("voiceStateUpdate", (oldMember, newMember) => {
	// Log voip usage
	adkVoice.adkVoice(oldMember, newMember, db);
	
	try {
		if (newMember && newMember.voiceChannel && newMember.voiceChannel.name.includes("voip")) {
			var role = newMember.guild.roles.find("name", "voip");
			newMember.addRole(role);
		}
	} catch(e) {
		console.log('An error occurred trying to auto-add the voip role on user joining the voip channel');
		users.forEach(user => {
			user.sendMessage('GMBot encountered an error on voice status update:\n\n' + err);
		});
	}
});

bot.on('messageUpdate', (oldmsg, newmsg) => {
	// Don't respond to bots
	if (newmsg.author.bot) {
		return;
	}

	// Catch clean-code and gmlive
	if (!prettifier.clean(newmsg)) {
		gmlive.read(newmsg);
	}
});

// When message is received
bot.on('message', msg => {

	// Don't respond to bots
	if (msg.author.bot) {
		return;
	}

	// Intercept all DM's
	if (msg.channel.type === 'dm') {
		if (dmLog[msg.author.username] === undefined) {
			dmLog[msg.author.username] = {
				user_id: msg.author.id,
				message_id: msg.id,
				new_message: msg.content,
				messages: [
					{
						user: msg.author.username,
						message: msg.content
					}
				]
			}
		} else {
			dmLog[msg.author.username].message_id = msg.id;
			dmLog[msg.author.username].new_message = msg.content;
			dmLog[msg.author.username].messages.push({
				user: msg.author.username,
				message: msg.content
			});
		}
	} else {
		if (msg.member) {
			if (msg.member.highestRole === '@everyone') {
				var attachments = msg.attachments.array();
				if (attachments.length !== 0) {
					attachments.forEach(attachment => {
						if (attachment.height !== undefined) {
							//User has uploaded an image
							if ((imageLog[msg.author.id] === undefined) || (imageLog[msg.author.id] === 0)) {
								imageLog[msg.author.id] = 1;
								imageLog.timers[msg.author.id] = setTimeout(() => {
									imageLog[msg.author.id] = 0;
								}, imageTimer);
							} else {
								if (imageLog[msg.author.id] >= imageCap) {
									msg.delete();
									msg.author.sendMessage('Your post was deleted because you have posted too many images recently! Please wait a few minutes and try again.');
								} else {
									imageLog[msg.author.id]++;
								}
							}
						}
					});
				}
			}
		}
	}

	// Find bad links
	if (new RegExp(badlinks.join("|")).test(msg.content)) {
		console.log("Deleted a message containing a bad link.");

		// PM USERS ABOUT BAD LINK
		/*
		 * To add users that will be pmd, add their numerical id to ids.json, then copy the following line, replacing 'mintypython' with the username in the json.
		 */
		pm.pm(ids.net8floz, msg, "Deleted a message with a bad link.  The person that posted it was "+msg.author.username+".  The content of the message was:\n\n"+msg.content);
		msg.delete();
		msg.channel.sendMessage("Heads up! @" + msg.author.username + " tried to post a malicious link. A log of this event has been recorded.");
	} else {
		parseMessage.run(msg);
		if (!prettifier.clean(msg)) {
			gmlive.read(msg);
		}
	}
});

/**
*	PROMISE REJECTION HANDLING
*/
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled promise.  Reason: ' + reason);
});

process.on('uncaughtException', (err) => {
  console.log(err);
	users.forEach(user => {
		user.sendMessage('GMBot has encoutered an uncaught exception. Attempting to a log of the error:\n\n' + err);
	});
});

// Login the bot using the auth token from auth.json
bot.login(auth.token);

// Express setup
express.run(bot, dmLog, db);

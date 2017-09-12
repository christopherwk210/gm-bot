// Init discord api
const Discord = require('discord.js');
const bot = new Discord.Client();

// Node libs
const fs = require("fs");

// Project libs
const database = require('./src/lib/database.js');
const pm = require('./src/lib/pm');
const parseMessage = require('./src/lib/parse-message');
const prettifier = require('./src/lib/prettifier');
const gmlive = require('./src/lib/gmlive');
const express = require('./src/express/express');
const adkVoice = require('./src/lib/voipUsage.js');
const adkProfile = require('./src/lib/profile.js');
const giveAways = require('./src/lib/giveAwayLib.js');

// Project data
const ids = require('./src/assets/json/ids.json');
const badlinks = require('./src/assets/json/bad-links.json');
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');

// Database setup
let db = database.initializeDatabase();

// Temp user storage
let responsibleUsers = [];

// Keep recent bot-dm log history in memory for the front-end
let dmLog = {};

// How often to log user presence
let profileInterval = undefined;

// Image upload limitting
let imageOptions = {
	imageLog: {
		timers: []
	},
	imageCap: 3,							//3 images within
	imageTimer: 1000 * 60 * 5 //5 minutes
};

// Auth token
let auth;

// Import authorization token
try {
	// Attempt to sync load auth.json
	auth = require('./src/assets/json/auth.json');
} catch (e) {
	// Well shit, ya didn't read the instructions did ya?
	console.log('No auth.json found. Please see /src/assets/auth.example.json.\n' + e.stack);

	// Goodbye
	process.exit();
}

// Bot callbacks
bot.on('ready', onBotReady);												// Bot is loaded
bot.on('guildMemberAdd', onBotGuildMemberAdd);			// A new member has joined
bot.on("voiceStateUpdate", onBotVoiceStateUpdate);	// Voice activity change
bot.on('messageUpdate', onBotMessageUpdate);				// Message updated
bot.on('message', onBotMessage);										// Message sent (in DM or in server channel)

/**
 * Called when the bot has reported ready status
 */
function onBotReady() {
	// Tell the world our feelings
	console.log("Squaring to go, captain.");
	
	// Fetch net8floz
	bot.fetchUser(ids.net8floz).then(user => { responsibleUsers.push(user); }, err => console.log(err));

	// Fetch topherlicious
	bot.fetchUser(ids.topherlicious).then(user => { responsibleUsers.push(user); }, err => console.log(err));

	// Grab our guild
	let guildCollection = bot.guilds.find('name','/r/GameMaker');

	// Log user presence on startup
	adkProfile.adkProfile(guildCollection, db);

	// Begin logging on interval
	profileInterval = setInterval(() => {
		adkProfile.adkProfile(guildCollection, db);
	}, profileInterval || 3600000);
}

/**
 * Called when the bot reports a new member joining the server
 * @param {GuildMember} member The member that joined
 */
function onBotGuildMemberAdd(member) {
	// Send the new user the welcome message
	member.sendEmbed({
		color: 26659,
		description: welcome,
		timestamp: new Date(),
		footer: {
			text: 'This is an automated message'
		}
	}).catch(err => console.log(err));
}

/**
 * Called whenever a user changes voice state
 * @param {GuildMember} oldMember The member before the voice state update
 * @param {GuildMember} newMember The member after the voice state update
 */
function onBotVoiceStateUpdate(oldMember, newMember) {
	// Log voip data
	adkVoice.adkVoice(oldMember, newMember, db);
	
	// Attempt to add voip_text role
	try {
		// Determine they are a member and in the voip channel
		if (newMember && newMember.voiceChannel && newMember.voiceChannel.name.includes("voip")) {
			// Fetch the proper role
			var role = newMember.guild.roles.find("name", "voip");

			// Add it
			newMember.addRole(role);
		}
	} catch(e) {
		// Something went wrong
		console.log('An error occurred trying to auto-add the voip role on user joining the voip channel');

		// Alert the peeps in charge of fixing it
		responsibleUsers.forEach(user => {
			user.sendMessage('GMBot encountered an error on voice status update:\n\n' + err);
		});
	}
}

/**
 * Called whenever a message is updated
 * @param {Message} oldMsg The message before the update
 * @param {Message} newMsg The message after the update
 */
function onBotMessageUpdate(oldMsg, newMsg) {
	// Don't respond to bots
	if (newMsg.author.bot) { return; }

	// Catch clean-code and gmlive edits
	if (!prettifier.clean(newMsg)) {
		gmlive.read(newMsg);
	}
}

/**
 * Called whenever a message is created
 * @param {Message} msg The created message
 */
function onBotMessage(msg) {
	// Don't respond to bots
	if (msg.author.bot) {
		return;
	}

	if (msg.author.username === 'AndrewBGM') {
		//msg.react('😩').catch(console.error);
	}

	if (msg.content.toUpperCase() === 'MM') {
		msg.react('🇲').then(() => {
			msg.react('Ⓜ').catch(console.error);
		}, () => {});
	} else if (msg.content.toUpperCase() === 'HMM') {
		msg.react('🇭').then(() => {
			msg.react('🇲').then(() => {
				msg.react('Ⓜ').catch(console.error);
			}, () => {});
		}, () => {});
	}

	if (msg.content.indexOf('🎁 💀') === 0) {
		msg.channel.sendMessage('<@277615099034730506>').catch(console.error);
	}

	if (msg.content.indexOf('<@295327000372051968>') !== -1) {
		msg.react('👋').catch(console.error);
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
			if ((msg.member.highestRole === '@everyone') || (msg.member.highestRole === 'voip')) {
				var attachments = msg.attachments.array();
				if (attachments.length !== 0) {
					attachments.forEach(attachment => {
						if (attachment.height !== undefined) {
							//User has uploaded an image
							if ((imageOptions.imageLog[msg.author.id] === undefined) || (imageOptions.imageLog[msg.author.id] === 0)) {
								imageOptions.imageLog[msg.author.id] = 1;
								imageOptions.imageLog.timers[msg.author.id] = setTimeout(() => {
									iimageOptions.mageLog[msg.author.id] = 0;
								}, imageOptions.imageTimer);
							} else {
								if (imageOptions.imageLog[msg.author.id] >= imageOptions.imageCap) {
									msg.delete();
									msg.author.sendMessage('Your post was deleted because you have posted too many images recently! Please wait a few minutes and try again.');
								} else {
									imageOptions.imageLog[msg.author.id]++;
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
}

// Handle process-wide promise rejection
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled promise.  Reason: ' + reason);
});

// Handle process-wide uncaught exceptions
process.on('uncaughtException', (err) => {
	console.log(err);
	
	// Alert the folks behind the curtain
	responsibleUsers.forEach(user => {
		user.sendMessage('GMBot has encoutered an uncaught exception. Attempting to a log of the error:\n\n' + err);
	});
});

// Login the bot using the auth token from auth.json
bot.login(auth.token);

// Express setup
express.run(bot, dmLog, db);

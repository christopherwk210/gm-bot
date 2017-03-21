// Init discord api
const Discord = require('discord.js');
const bot = new Discord.Client();

// Node libs
const fs = require("fs");

// Project libs
const detectRole = require('./src/lib/detectRole');
const pm = require('./src/lib/pm');
const parseMessage = require('./src/lib/parse-message');
const prettifier = require('./src/lib/prettifier');
const gmlive = require('./src/lib/gmlive');

// Project  data
const ids = require('./src/assets/json/ids.json');
const badlinks = require('./src/assets/json/bad-links.json');
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');

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
	if (newMember && newMember.voiceChannel && newMember.voiceChannel.name.includes("voip")) {
		var role = newMember.guild.roles.find("name", "voip_text");
		newMember.addRole(role);
	}
});

// When message is received
bot.on('message', msg => {

	// Don't respond to bots
	if (msg.author.bot || detectRole.detectRole(msg.member, msg.guild, "Admins")) {
		return;
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
		prettifier.clean(msg);
		gmlive.read(msg);
	}
});

/**
*	PROMISE REJECTION HANDLING
*/
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled promise.  Reason: ' + reason);
});

// Login the bot using the auth token from auth.json
bot.login(auth.token);

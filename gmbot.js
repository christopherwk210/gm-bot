//Initialize bot
const Discord = require('discord.js');
const bot = new Discord.Client();
const detectRole = require('./detectRole');
const pm = require('./pm');
const ids = require('./ids.json');
const parseMessage = require('./parse-message.js');
const prettifier = require('./prettifier.js');
const gmlive = require('./gmlive.js');

const badlinks = [
	"dropboxx\\.ga",
	"youutube\\.ga",
	"orjexmodder\\.tk",
	"linkit\\.ml",
	"ip\\.jlynx\\.net",
	"grabbify\\.tk",
	"grabbify\\.link",
	"grabbify\\.ga",
	"dropboxx\\.ga",
	"avoxhosting\\.tk",
];


var auth;
try {
	auth = require("./auth.json");
} catch (e){
	console.log("No auth.json found. Please see auth.example.json.\n"+e.stack);
	process.exit();
}

bot.on('ready', () => {
	console.log("Squaring to go, captain.");
});

bot.on('guildMemberAdd', member => {
	member.sendMessage('Hey welcome to /r/gamemaker here\'s a welcome message.');
});

//When message is received
bot.on('message', msg => {

	//Don't respond to bots
	if (msg.author.bot || detectRole.detectRole(msg.member, msg.guild, "Admins")) {
		return;
	}

	//FOUND A BAD LINK
	if (new RegExp(badlinks.join("|")).test(msg.content)) {
		console.log("Deleted a message containing a bad link.");

		//PM USERS ABOUT BAD LINK
		/*
		 * To add users that will be pmd, add their numerical id to ids.json, then copy the following line, replacing 'mintypython' with the username in the json.
		 */
		pm.pm(ids.net8floz, msg, "Deleted a message with a bad link.  The person that posted it was "+msg.author.username+".  The content of the message was:\n\n"+msg.content);
		msg.delete();
		msg.channel.sendMessage("Heads up! @" + msg.author.username + " tried to post a malicious link. A log of this event has been recorded.");
	}else{
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

bot.login(auth.token);

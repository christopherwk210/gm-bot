const pm = function(id, msg, message){
	if(msg.guild){
		var user = msg.guild.members.get(id);
		if(user){
			user.sendMessage(message);
			console.log("PM'd user.");
		}else{
			console.log("User not found!");
		}
	}
	console.log("Message was sent in a channel without a guild.");
};

module.exports.pm = pm;
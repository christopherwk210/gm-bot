const detectRole = function(member, guild, roleName){
	if(guild) {
		var adminRole = guild.roles.find("name", roleName);
		return member.roles.has(adminRole);
	}
	return false;
};

module.exports.detectRole = detectRole;

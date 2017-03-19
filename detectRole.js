

const detectRole = function(member, guild, roleName){
	var adminRole = guild.roles.find("name", roleName);
	return member.roles.has(adminRole);
};

module.exports.detectRole = detectRole;
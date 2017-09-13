/**
 * Detects if a member is staff or not
 * @param {GuildMember} member Discord.js GuildMember
 * @return {any} returns 'admin' || 'rubber' || 'art' || false
 */
module.exports = function(member) {
  if (!member.roles) {
    return false;
  } else if ((member.roles.find('name', 'admin') || member.roles.find('name', 'admins'))) {
    return 'admin';
  } else if (msg.member.roles.find('name', 'rubber duckies')) {
    return 'rubber';
  } else if (msg.member.roles.find('name', 'art duckies')) {
    return 'art';
  } else {
    return false;
  }
};
/**
 * Detects if a member is staff or not
 * @param {GuildMember} member Discord.js GuildMember
 * @return {any} returns 'admin' || 'rubber' || 'art' || false
 */
module.exports = function(member) {
  if ((!member) || (!member.roles)) {
    return false;
  } else if (member.roles.find('name', 'admin') || member.roles.find('name', 'admins') || member.roles.find('name', 'subreddit mods 📄')) {
    return 'admin';
  } else if (member.roles.find('name', 'rubber duckies') || member.roles.find('name', 'duckies🐤')) {
    return 'rubber';
  } else if (member.roles.find('name', 'art duckies')) {
    return 'art';
  } else if (member.roles.find('name', 'audio duckies')) {
    return 'audio';
  } else {
    return false;
  }
};

/**
 * Toggles the streamy role!
 * @param {Message} msg Discord message
 */
module.exports = function(msg) {
  // Ensure we are not in DM
  if ((msg.member) && (msg.member.roles)) {
    let alreadyHas = false;
    let streamerRole;
    let roleName;

    // Determine if we have the role
    msg.member.guild.roles.forEach(role => {
      if (role.name.indexOf('stream') !== -1) {
        streamerRole = role.id;
        roleName = role.name;
        alreadyHas = msg.member.roles.exists('name', role.name);
      }
    });

    // If we do
    if (alreadyHas) {
      // Remove it
      msg.member.removeRole(streamerRole).then(() => {
        // Give it to 'em straight
        msg.author.send(`Your ${roleName} role has been removed!`);
      }, () => {});
    } else {
      // Otherwise, add it
      msg.member.addRole(streamerRole).then(() => {
        // Spit it out
        msg.author.send(`You've been granted the ${roleName} role!`);
      }, () => {});
    }
  } else {
    // Come on, man
    msg.author.send('This function is not applicable outside of the /r/GameMaker server.');
  }
};

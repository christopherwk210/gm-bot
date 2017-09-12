/**
 * Toggles the streamy role!
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
 */
module.exports = function(msg, args) {
  // Ensure we are not in DM
  if ((msg.member) && (msg.member.roles)) {
    let alreadyHas = false;
    let streamerRole;

    // Determine if we have the role
    msg.member.guild.roles.forEach(role => {
      if (role.name.indexOf('stream') !== -1) {
        streamerRole = role.id;
        alreadyHas = msg.member.roles.exists('name', role.name);
      }
    });

    // If we do
    if (alreadyHas) {
      // Remove it
      msg.member.removeRole(streamerRole).then(res => {
        //console.log('add')
      }, err => {
        //console.log(err)
      });
    } else {
      // Otherwise, add it
      msg.member.addRole( streamerRole ).then(res => {
        //console.log('add');
      }, err => {
        //console.log(err);
      });
    }
  } else {
    // Come on, man
    msg.author.sendMessage('This function is not applicable outside of the /r/GameMaker server.');
  }
};

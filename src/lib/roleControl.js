/**
 * Handles role control from the bot
 */
module.exports = {
  /**
   * Toggles a user rold
   * @param {Message} msg Discord message
   * @param {Array<string>} args Command arguments
   */
  toggleRole: function(msg, args) {
    // Get the role from the argument
    roleName = args.splice(1);

    // Ensure we aren't in DM
    if ((msg.guild === null) || (msg.guild === undefined)) {
      msg.author.sendMessage('`!role` does not work inside direct messages.');
      return;
    }

    // Determine proper role
    let role = this.getRole(msg.guild.roles, roleName);

    // On role
    switch (role) {
      case 'ducky':
        // lol
        this.ducky(msg.author);
        break;
      case 'noone':
        // No dice, kid
        msg.author.sendMessage('That is not a valid role');
        break;
      default:
        // Nothing?
        if (role === undefined) {
          return;
        }

        // If they've got the role
        if (msg.member.roles.has(role.id)) {
          // Remove it
          msg.member.removeRole(role);

          // Report it
          msg.author.sendMessage('Role ' + role.name + ' was removed.');
        } else {
          // Otherwise, add it
          msg.member.addRole(role);
          
          // Tell em
          msg.author.sendMessage('Role ' + role.name + ' has been granted.');
        }
        break;
    }
  },
  /**
   * Finds a role from the givin guild roles
   * @param {Collection} roles Guild roles
   * @param {string} roleName Guild row to get
   */
  getRole: (roles, roleName) => {
    if (!roleName[0]) {
      return 'noone';
    }

    switch (roleName[0].toUpperCase()) {
      case 'VOIP':
        return roles.find('name', 'voip');
        break;
      case 'STREAMY':
        let streamerRole;
        roles.forEach(role => {
          if (role.name.indexOf('stream') !== -1) {
            streamerRole = role;
          }
        });
        return streamerRole;
        break;
      case 'DUCKY':
        return 'ducky';
        break;
      default:
        return 'noone';
        break;
    }
  },
  /**
   * Displays a random wise-guy answer
   * @param {User} Author Discord user
   */
  ducky: (author) => {
    let responses = ['Cute.  No.', 'Nice try.', 'No way.', 'Nope.'];
    return author.sendMessage(responses[Math.floor(Math.random() * responses.length)]);
  }
};

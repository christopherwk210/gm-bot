let roleService = require('../services/role.service');

/**
 * Toggles a user role
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
 */
module.exports = function(msg, args) {
  // Get the role from the argument
  let roleName = args.splice(1);

  // Ensure we aren't in DM
  if ((msg.guild === null) || (msg.guild === undefined) || !msg.member) {
    msg.author.send('`!role` does not work inside direct messages, and can sometimes fail when a user name has unicode characters in it. Please contact topherlicious or one of the other admins if you need help with your role.');
    return;
  }

  let role = 'noone';

  // Ensure there is a role passed
  if (roleName[0]) {
    switch (roleName[0].toUpperCase()) {
      case 'VOIP':
        role = roleService.getRoleByID('275366872189370369');
        break;
      case '3D':
        role = roleService.getRoleByID('379657591657201674');
        break;
      case 'DUCKY':
        role = 'ducky';
        break;
      default:
        role = 'noone';
        break;
    }
  }

  // On role
  switch (role) {
    case 'ducky':
      // lol
      let responses = ['Cute.  No.', 'Nice try.', 'No way.', 'Nope.'];
      return msg.author.send(responses[Math.floor(Math.random() * responses.length)]);
    case 'noone':
      // No dice, kid
      msg.author.send('That is not a valid role');
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
        msg.author.send(`Role ${role.name} was removed.`);
      } else {
        // Otherwise, add it
        msg.member.addRole(role);
        
        // Tell em
        msg.author.send(`Role ${role.name} has been granted.`);
      }
      break;
  }
};

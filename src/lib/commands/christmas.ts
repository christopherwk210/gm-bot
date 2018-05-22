// Possible colors
let colors = [
  [255, 0, 0],
  [0, 150, 0],
  [254, 254, 254]
];

// Current role assignment
let roleColorAssignment = [
  0,
  1,
  2
];

let currentCycle, guildRoles;

/**
 * Assigns the christmas colors to each role
 * @param {GuildRoles} roles 
 */
function assign(roles) {
  roles.forEach(role => {
    if (role.name === 'A') role.setColor(colors[roleColorAssignment[0]]);
    if (role.name === 'B') role.setColor(colors[roleColorAssignment[1]]);
    if (role.name === 'C') role.setColor(colors[roleColorAssignment[2]]);
  });
}

/**
 * Cycles the christmas role colors
 */
function cycle() {
  let newAssignment = [];
  roleColorAssignment.forEach(i => {
    if (i < 2) {
      i++;
    } else {
      i = 0;
    }

    newAssignment.push(i);
  });

  roleColorAssignment = newAssignment;
}

/**
 * Triggers a color cycle from a message
 * @param {Message} msg 
 */
function triggerCycle(msg) {
  cycle();
  assign(msg.member.guild.roles);
}

/**
 * Kicks off/Restarts the color autocycling
 * @param {Message} msg 
 */
function autoCycle(msg) {
  // Clear current auto cycle
  if (currentCycle) clearInterval(currentCycle);

  guildRoles = msg.member.guild.roles;

  // Cycle colors every 15 minutes
  currentCycle = setInterval(() => {
    cycle();
    assign(guildRoles);
  }, 1000 * 60 * 15);
}

module.exports = {
  cycle: triggerCycle,
  autoCycle: autoCycle
};

/**
 * Contains information about all of the server's roles
 */
let roleService = {
  /**
   * Contains all server role names
   * @type {string[]}
   */
  roleNames: [],

  /**
   * Contains all server role objects
   * @type {object}
   */
  roles: {},

  /**
   * Initialize the role service with the bot client
   * @param {*} client Bot client object
   */
  init: function(client) {
    let guild = client.guilds.first();
    guild.roles.array().forEach(role => {
      this.roleNames.push(role.name);
      this.roles[role.name] = role;
    });
  }
};

module.exports = roleService;

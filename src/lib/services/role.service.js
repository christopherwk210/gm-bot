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
  },

  /**
   * Returns the server role with the exact given name
   * @param {string} name Role name
   */
  getRoleByName: function(name) {
    return this.roles[name];
  },

  /**
   * Returns the server role with the exact given id number
   * @param {string} id Role id
   */
  getRoleByID: function(id) {
    let match;

    this.roles.some(role => {
      if (role.id === id) {
        match = role;
        return true;
      }
    });

    return match;
  }
};

module.exports = roleService;

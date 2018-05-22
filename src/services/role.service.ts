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
   * Contains all server roles in an array
   * @type {Array<*>}
   */
  roles: [],

  /**
   * Initialize the role service with the bot client
   * @param {*} client Bot client object
   */
  init: function(client) {
    let guild = client.guilds.first();
    guild.roles.array().forEach(role => {
      this.roleNames.push(role.name);
      this.roles.push(role);
    });
  },

  /**
   * Returns the server role with the exact given name
   * @param {string} name Role name
   */
  getRoleByName: function(name) {
    let match;

    this.roles.some(role => {
      if (role.name === name) {
        match = role;
        return true;
      }
    });

    return match;
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

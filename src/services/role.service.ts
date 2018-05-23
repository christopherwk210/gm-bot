import { Role, Client } from "discord.js";

interface RoleService {
  /** Contains all server role names */
  roleNames: string[];

  /** Contains all server roles in an array */
  roles: Role[];

  /** Initialize the role service with the bot client */
  init(client: Client);

  /** Returns the server role with the exact given name */
  getRoleByName(name: string);

  /** Returns the server role with the exact given id number */
  getRoleByID(id: string);
}

/**
 * Contains information about all of the server's roles
 */
export let roleService: RoleService = {
  roleNames: [],
  roles: [],

  init: function(client) {
    let guild = client.guilds.first();
    guild.roles.array().forEach(role => {
      this.roleNames.push(role.name);
      this.roles.push(role);
    });
  },

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

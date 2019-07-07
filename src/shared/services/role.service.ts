import { Role, Client } from 'discord.js';

/**
 * Contains information about the server roles
 */
class RoleService {
  /** Contains all server role names */
  roleNames: string[] = [];

  /** Contains all server roles in an array */
  roles: Role[] = [];

  /** Initialize the role service with the bot client */
  init(client: Client) {
    let guild = client.guilds.first();
    guild.roles.array().forEach(role => {
      this.roleNames.push(role.name);
      this.roles.push(role);
    });
  }

  /** Returns the server role with the exact given name */
  getRoleByName(name: string): Role {
    return this.roles.find(role => role.name === name);
  }

  /** Returns the server role with the exact given id number */
  getRoleByID(id: string): Role {
    return this.roles.find(role => role.id === id);
  }
}

export let roleService = new RoleService();

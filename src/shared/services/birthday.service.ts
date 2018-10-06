import { jsonService } from './json.service';
import { User, Guild, Role, Client, GuildMember } from 'discord.js';
import { birthdayTimeout, serverIDs } from '../../config';
import { roleService } from '../../shared';

/**
 * Manages birthday timers
 */
class BirthdayService {
  birthdayTimestamp: object = {};
  birthdayTimeout: object = {};
  guild: Guild;

  /** Load active birthday timers from file */
  init(client: Client) {
    // Save guild for later
    this.guild = client.guilds.first();

    let loadedBirthdays = jsonService.files['birthdayTimers'];
    if (loadedBirthdays) {
      // do stuff to load timers
      console.log('load timers');
    }
  }

  /**
   * add birthday and add to file
   */
  addBirthday(user: GuildMember) {
    let birthdayRole = roleService.getRoleByID(serverIDs.birthdayRoleID);

    // add role to user
    if (!user.roles.has(birthdayRole.id)) {
      user.addRole(birthdayRole);
    }

    // clear old timeout
    if (user.id in this.birthdayTimeout) {
      clearTimeout(this.birthdayTimeout[user.id]);
    }

    // add new timeout
    this.birthdayTimestamp[user.id] = new Date().getTime(); // timestamp in milliseconds
    this.birthdayTimeout[user.id] = setTimeout(() => {
      this.removeBirthday(user);
    }, birthdayTimeout);

    user.send(':tada: The **/r/GameMaker Discord** wishes you a happy birthday! :tada:\n' +
              'You\'ve been granted the shiny birthday role and colors for 24 hours\n' +
              'Should you wish to remove it at any time, just message me `!birthday end` and I\'ll remove it for you.');
  }

  /**
   * end birthday and remove from json
   */
  removeBirthday(user: any) {
    let birthdayRole = roleService.getRoleByID(serverIDs.birthdayRoleID);

    // remove role from user
    this.guild.fetchMember(user.id).then(member => {
      if (member.roles.has(birthdayRole.id)) {
        member.send('Your birthday role has been removed, see you next year!');
        member.removeRole(birthdayRole);
      }
    });

    if (user.id in this.birthdayTimeout) {
      clearTimeout(this.birthdayTimeout[user.id]);
      delete this.birthdayTimeout[user.id];
    }
    if (user.id in this.birthdayTimestamp) {
      delete this.birthdayTimestamp[user.id];
    }

  }
}

export let birthdayService = new BirthdayService();

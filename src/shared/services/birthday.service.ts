import { jsonService } from './json.service';
import { User, Guild, Client, GuildMember } from 'discord.js';
import { birthdayTimeout, serverIDs } from '../../config';

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
    // add role to user
    if (!user.roles.has(serverIDs.birthdayRoleID)) {
      user.addRole(serverIDs.birthdayRoleID);
      console.log("granted role");
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

    user.send(':tada: The */r/GameMaker Discord* wishes you a happy birthday! :tada:\n' +
              'You\'ve been granted the shiny birthday role and colors for 24 hours\n' +
              'Should you wish to remove it at any time, just message me `!birthday end` and I\'ll remove it for you.');
    console.log('addBirthday for ' + user.displayName);
    console.log(this.birthdayTimestamp);
  }

  /**
   * end birthday and remove from json
   */
  removeBirthday(user: any) {
    // remove role from user
    if (user.roles) {
      // passed a GuildMemeber
      console.log('Attempting to remove role')
      if (user.roles.has(serverIDs.birthdayRoleID)) {
        user.removeRole(serverIDs.birthdayRoleID);
        console.log('Removed role');
      }
    } else {
      // passed only a user
      this.guild.fetchMember(user.id).then(member => {
        if (member.roles.has(serverIDs.birthdayRoleID)) {
          member.removeRole(serverIDs.birthdayRoleID);
        }
      });
    }

    if (user.id in this.birthdayTimeout) {
      clearTimeout(this.birthdayTimeout[user.id]);
      delete this.birthdayTimeout[user.id];
    }
    if (user.id in this.birthdayTimestamp) {
      delete this.birthdayTimestamp;
    }

    user.send('Your birthday role has been removed, see you next year!');
    console.log('removeBirthday for ' + user.displayName);
    console.log(this.birthdayTimestamp);
  }
}

export let birthdayService = new BirthdayService();

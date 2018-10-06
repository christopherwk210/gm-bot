import { jsonService } from './json.service';
import { User, Guild } from 'discord.js';
import { birthdayTimeout, serverIDs } from '../../config';

/**
 * Manages birthday timers
 */
class BirthdayService {
  birthdays: object = {};
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
    }

    // clear old timeout
    if (user.id in this.birthdays) {
      clearTimeout(this.birthdays[user.id].timeout);
    }

    // add new timeout
    birthdays[user.id].starttime = new Date().getTime(); // timestamp in milliseconds
    birthdays[user.id].timeout = setTimeout(() => {
      this.removeBirthday(user);
    }, birthdayTimeout);

    user.send(':tada: The /r/GameMaker Discord wishes you a happy birthday! :tada:\n' +
              'You\'ve been granted the shiny birthday role and colors for 24 hours\n' +
              'Should you wish to remove it at any time, just message me `!birthday end` and I\'ll remove it for you.');
    console.log('addBirthday for ' + user.displayName);
    console.log(this.birthdays);
  }

  /**
   * end birthday and remove from json
   */
  removeBirthday(user: User | GuildMember) {
    // remove role from user
    if (user.roles) {
      // passed a GuildMemeber
      if (user.roles.has(serverIDs.birthdayRoleID)) {
        user.removeRole(serverIDs.birthdayRoleID);
      }
    } else {
      // passed only a user
      this.guild.fetchMember(user.id).then(member => {
        member.removeRole(serverIDs.birthdayRoleID);
      });
    }

    if (user.id in this.birthdays) {
        clearTimeout(this.birthdays[user.id].timeout);
        delete this.birthdays[user.id];
    }
    user.send('Your birthday role has been removed, see you next year!');
    console.log('removeBirthday for ' + user.displayName);
    console.log(this.birthdays);
  }
}

export let birthdayService = new BirthdayService();

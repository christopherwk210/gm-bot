import * as path from 'path';
import * as fs from 'fs';
import { jsonService, AsyncWriter } from './json.service';
import { User, Guild, Role, Client, GuildMember } from 'discord.js';
import { birthdayTimeout, serverIDs } from '../../config';
import { roleService } from '../../shared';

/**
 * Manages birthday timers
 */
class BirthdayService {
  /** Storage for ongoing birthdays */
  private timestamps: BirthdayContainer = {};
  private timeouts: BirthdayContainer = {};

  /** We need this for member lookups when interacting in DM */
  private guild: Guild;

  /** The writer for JSON cache of ongoing birthdays */
  private birthdayDataPath = path.join(__dirname, '../../../data/birthdayData.json');
  private asyncWriter: AsyncWriter;

  constructor() {
    this.timestamps = this.loadExistingData();
    // restore timers from file
    for (let userid in this.timestamps) {
      if (this.timestamps.hasOwnProperty(userid)) {

        let timestamp = this.timestamps[userid];
        let newTimeout = timestamp - new Date().getTime();
        if (newTimeout < 10 * 1000) {
          // make sure timeout is at least 10 seconds into the future to avoid
          // trying to revoke roles immediately on startup
          newTimeout = 10 * 1000;
        }

        this.timeouts[userid] = setTimeout(() => {
          let user = {id: userid};
          this.removeBirthday(user);
        }, newTimeout);
        //console.log('Restored birthday timeout for ' + userid + ' timer: ' + newTimeout);
      }
    }

    this.asyncWriter = jsonService.getAsyncWriter(this.birthdayDataPath, true);
  }

  /** Load active birthday timers from file */
  init(client: Client) {
    // Save guild for later
    this.guild = client.guilds.first();
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
    if (this.timeouts[user.id]) {
      clearTimeout(this.timeouts[user.id]);
    }

    // add new timeout
    this.timestamps[user.id] = new Date().getTime() + birthdayTimeout; // expiration timestamp in milliseconds
    this.timeouts[user.id] = setTimeout(() => {
      this.removeBirthday(user);
    }, birthdayTimeout);

    user.send(':tada: The **/r/GameMaker Discord** wishes you a happy birthday! :tada:\n' +
              'You\'ve been granted the shiny birthday role and colors for 24 hours\n' +
              'Should you wish to remove it at any time, just message me `!birthday end` and I\'ll remove it for you.');
    this.save();
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

    if (this.timeouts[user.id]) {
      clearTimeout(this.timeouts[user.id]);
      delete this.timeouts[user.id];
    }
    if (this.timestamps[user.id]) {
      delete this.timestamps[user.id];
    }
    this.save();
  }

  /** Loads existing data, or creates it if not present */
  private loadExistingData() {
    let exists = fs.existsSync(this.birthdayDataPath);
    if (exists) {
      return JSON.parse(fs.readFileSync(this.birthdayDataPath, 'utf8'));
    } else {
      fs.writeFileSync(this.birthdayDataPath, '{}', 'utf8');
      return {};
    }
  }

  /** Saves all current birthday data */
  private save() {
    this.asyncWriter(this.timestamps);
  }
}

export let birthdayService = new BirthdayService();

interface BirthdayContainer {
  [key: string]: any;
}

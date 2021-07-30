import { Message, TextChannel } from 'discord.js';
import { prefixedCommandRuleTemplate, serverIDs } from '../../config';
import { channelService, Command, CommandClass, detectStaff, roleService } from '../../shared';

/** Colors to cycle through */
const colors = {
  RED: '#ff0000',
  GREEN: '#009600',
  YELLOW: '#f1c40f'
};

/** Stores the cyclable roles and their current colors */
let roles = {
  A: {
    role: () => roleService.getRoleByName('A'),
    color: colors.RED
  },
  B: {
    role: () => roleService.getRoleByName('B'),
    color: colors.GREEN
  },
  C: {
    role: () => roleService.getRoleByName('C'),
    color: colors.YELLOW
  }
};

@Command({
  matches: ['christmascycle', 'christmasautocycle', 'christmasstop', 'commencejingle'],
  ...prefixedCommandRuleTemplate
})
export class ChristmasCommand implements CommandClass {
  /** Interval reference to auto-cycling */
  cycleInterval;

  action(msg: Message, args: string[]) {
    switch (args[0].slice(1)) {
      case 'christmasautocycle':
        this.setAutoCycle();
        break;
      case 'christmasstop':
        if (this.cycleInterval) clearInterval(this.cycleInterval);
        break;
      default:
      case 'christmascycle':
        this.cycle();
        break;
      case 'commencejingle':
        if (msg.author.id === '144913457429348352') {
          this.setupRoles(msg);
        }
        break;
    }
  }

  /**
   * Only admins can hold the mighty power of christmas
   * @param msg 
   * @param args
   */
  pre(msg: Message, args: string[]) {
    return !!detectStaff(msg.member);
  }

  setupRoles(msg: Message) {
    console.log('setting up roles');
    msg.guild.members.fetch().then(async members => {
      console.log('members fetched');
      let keys = Object.keys(roles);
      let lastKey = keys[0];
      let success = 0;
      let failure = 0;
      for (const member of members.array()) {
        const key = lastKey;
        console.log(member.user.username);

        try {
          await member.roles.add(roles[key].role());
          success++;
        } catch (e) {
          failure++;
        }

        if (keys.indexOf(lastKey) === keys.length - 1) {
          lastKey = keys[0];
        } else {
          lastKey = keys[keys.indexOf(lastKey) + 1];
        }
      }

      const botTesting: TextChannel = channelService.getChannelByID(serverIDs.channels.botTestingChannelID) as TextChannel;
      botTesting.send(`Success: ${success}\nFailure: ${failure}`);
    });
  }

  /**
   * Cycles the christmas role colors. This is automatic,
   * and can handle any number of colors and roles. 
   */
  cycle() {
    // Turn all available colors into an array
    let colorArray = Object.values(colors);

    // Iterate over each role
    Object.keys(roles).forEach(key => {
      // Get the current color of this role
      let currentColor = roles[key].color;

      // Find it's index in the color array
      let currentIndex = colorArray.indexOf(currentColor);

      // Move the index up one or loop back to the start
      let newIndex = currentIndex === colorArray.length - 1 ? 0 : currentIndex + 1;

      // Assign the color with the new index
      roles[key].color = colorArray[newIndex];

      // Set the color of the role
      roles[key].role().setColor(roles[key].color);
    });
  }

  /**
   * Triggers automatic role cycling
   * @param minutes How fast to cycle, in minutes (15 by default)
   */
  setAutoCycle(minutes: number = 15) {
    if (this.cycleInterval) clearInterval(this.cycleInterval);
    this.cycleInterval = setInterval(this.cycle, (1000 * 60) * minutes);
  }
}

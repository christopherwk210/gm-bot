import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, roleService } from '../../shared';

@Command({
  matches: ['christmascycle', 'christmasautocycle'],
  ...prefixedCommandRuleTemplate
})
export class ChristmasCommand implements CommandClass {
  /** Colors to cycle through */
  colors = {
    RED: '#ff0000',
    GREEN: '#009600',
    WHITE: '#fefefe'
  };

  /** Stores the cyclable roles and their current colors */
  roles = {
    A: {
      role: roleService.getRoleByName('A'),
      color: this.colors.RED
    },
    B: {
      role: roleService.getRoleByName('B'),
      color: this.colors.GREEN
    },
    C: {
      role: roleService.getRoleByName('C'),
      color: this.colors.WHITE
    }
  };

  /** Interval reference to auto-cycling */
  cycleInterval;

  action(msg: Message, args: string[]) {
    switch (args[0].slice(1)) {
      case 'christmasautocycle':
        this.setAutoCycle();
        break;
      default:
      case 'christmascycle':
        this.cycle();
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

  /**
   * Cycles the christmas role colors. This is automatic,
   * and can handle any number of colors and roles. 
   */
  cycle() {
    // Turn all available colors into an array
    let colorArray = Object.values(this.colors);

    // Iterate over each role
    Object.keys(this.roles).forEach(key => {
      // Get the current color of this role
      let currentColor = this.roles[key].color;

      // Find it's index in the color array
      let currentIndex = colorArray.indexOf(currentColor);

      // Move the index up one or loop back to the start
      let newIndex = currentIndex === colorArray.length ? 0 : currentIndex + 1;

      // Assign the color with the new index
      this.roles[key].color = colorArray[newIndex];

      // Set the color of the role
      this.roles[key].role.setColor(this.roles[key].color);
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

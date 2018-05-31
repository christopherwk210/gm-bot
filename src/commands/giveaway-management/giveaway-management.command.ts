import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, giveawayService, Giveaway } from '../../shared';

@Command({
  matches: ['giveaway-management', 'gaa'],
  ...prefixedCommandRuleTemplate
})
export class GiveawayManagementCommand implements CommandClass {

  /**
   * Allows giveaway management from within Discord
   * @param msg 
   * @param args
   */
  async action(msg: Message, args: string[]) {
    switch (args[1]) {
      case '-q':
        msg.channel.send(this.quickCreate(args[2], args[3]));
        break;
      case '-x':
        giveawayService.deleteGiveaway(args[2]);
        msg.channel.send(`If the ${args[2]} did exist, it definitely doesn't now.`);
        break;
      case '-d':
        msg.channel.send(this.drawWinner(args[2]));
        break;
      default:
        let giveaways = giveawayService.giveawayArray();
        for (let giveaway of giveaways) {
          await msg.author.send(this.createGiveawayString(giveaway));
        }
        break;
    }
  }

  pre(msg: Message, args: string[]) {
    return detectStaff(msg.member) === 'admin';
  }

  /**
   * Draws a winner for a giveaway
   * @param name giveaway name
   * @returns Result message
   */
  drawWinner(name: string) {
    let result = giveawayService.drawWinner(name);

    if (typeof result === 'string') return result;
    return `A winner has been drawn for the ${name} giveaway! The new winner is <@${result[0].id}>`;
  }

  /**
   * Quickly create a giveaway that begins immediately
   * @param name Name of the giveaway
   * @param days How many days the giveaway should last, default 1
   * @returns Result message
   */
  quickCreate(name: string, days: string = '1') {
    let parsedDays = parseInt(days, 10);

    // Account for stupidity
    if (!name) return 'You need to supply a name dude! Something like: `!gaa -q myCoolGiveaway 2` for a giveaway named `myCoolGiveaway`.';
    if (!days || isNaN(parsedDays)) return 'You need to supply a length! For example: `!gaa -q gaName 2` for a giveaway that lasts 2 days.';

    let now = new Date();
    let later = new Date();

    // Push the end date by the correct amount of days
    later.setDate(now.getDate() + parseInt(days, 10));

    // Create the giveaway
    let giveaway = giveawayService.createGiveaway(name, now, later);

    if (!giveaway) return 'A giveaway with that name already exists.';
    return 'Giveaway created!';
  }

  /**
   * Creates a formatted code block string from a giveaway
   * @param giveaway 
   */
  createGiveawayString(giveaway: Giveaway) {
    let message = '```\n';
    message += `Name: ${giveaway.name}\n`;
    message += `Start: ${giveaway.start.toString()}\n`;
    message += `End: ${giveaway.end.toString()}\n`;
    message += `Number of participants: ${giveaway.participants.length}\n`;
    message += `Winners: \n`;
    giveaway.winners.forEach(winner => {
      message += `  ${winner.name} | ${winner.id}\n`;
    });
    message += '```';
    return message;
  }
}

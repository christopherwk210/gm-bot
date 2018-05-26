import fs = require('fs');
import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, markdownService } from '../../shared';

@Command({
  matches: ['commandment', 'rtfm'],
  ...prefixedCommandRuleTemplate
})
export class CommandmentCommand implements CommandClass {
  /** Markdown list of all commandments */
  commandmentList = markdownService.files['commandments'];

  /** Links to all commandment gifs */
  commandmentURLs = [
    'https://gfycat.com/gifs/detail/KindlyKeenGrayreefshark',
    'https://gfycat.com/gifs/detail/HarmlessBlondIchneumonfly',
    'https://gfycat.com/gifs/detail/ElderlyShadowyFishingcat',
    'https://gfycat.com/gifs/detail/ThreadbareBareDonkey',
    'https://gfycat.com/gifs/detail/MediocreYellowishHapuka',
    'https://gfycat.com/gifs/detail/ExhaustedDistantCutworm',
    'https://gfycat.com/gifs/detail/FriendlyVengefulJackal',
    'https://gfycat.com/gifs/detail/DishonestHorribleGopher',
    'https://gfycat.com/gifs/detail/UniformLiquidAlbacoretuna',
    'https://gfycat.com/gifs/detail/SparseRevolvingGavial',
    'https://gfycat.com/gifs/detail/LongAnchoredFlee',
    'https://gfycat.com/gifs/detail/MiserablePhysicalKob',
    'https://gfycat.com/gifs/detail/IllustriousFinishedBernesemountaindog',
    'https://gfycat.com/gifs/detail/RapidDisfiguredDegus',
    'https://gfycat.com/gifs/detail/PiercingSatisfiedAoudad'
  ];

  /**
   * @param msg 
   * @param args
   */
  action(msg: Message, args: string[]) {
    // rtfm is an alias for the first commandment
    if (args[0].slice(1) === 'rtfm') {
      args = ['rtfm', 'I'];
    }

    // Make sure an argument was provided
    if (args[1]) {
      // If they want a list
      if (args[1] === 'list') {
        // Give it to 'em
        msg.author.send(this.commandmentList);
        return;
      }

      // Figure this roman numeral shit out
      let numeral = this.fromRoman(args[1]);

      // Send the right link
      msg.channel.send(this.commandmentURLs[numeral - 1]);
    }
  }

  /**
   * Convert roman numeral to number
   * @param str Roman numeral string
   */
  fromRoman(str: string) {
    let romanString = str;
    let result = 0;
    let decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    let roman = ['M', 'CM','D','CD','C', 'XC', 'L', 'XL', 'X','IX','V','IV','I'];
    for (let i = 0; i <= decimal.length; i++) {
      while (romanString.indexOf(roman[i]) === 0) {
        result += decimal[i];
        romanString = romanString.replace(roman[i], '');
      }
    }
    return result;
  }
}

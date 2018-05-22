// Node libs
import fs = require('fs');

// Project data
const commandmentList = fs.readFileSync('./shared/assets/markdown/commandments.md', 'utf8');
const commandmentURLs = [
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
 * Convert roman numeral to number
 * @param {string} str Roman numeral string
 */
function fromRoman(str) {
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

module.exports = function(msg, args) {
  // Make sure an argument was provided
  if (args[1]) {
    // If they want a list
    if (args[1] === 'list') {
      // Give it to 'em
      msg.author.send(commandmentList);
      return;
    }

    // Figure this roman numeral shit out
    let numeral = fromRoman(args[1]);

    // Send the right link
    msg.channel.send(commandmentURLs[numeral - 1]);
  }
};

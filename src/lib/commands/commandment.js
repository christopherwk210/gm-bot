// Node libs
const fs = require('fs');

// Project data
const commandmentList = fs.readFileSync('./src/assets/markdown/commandments.md', 'utf8');

/**
 * Convert roman numeral to number
 * @param {string} str Roman numeral string
 */
function fromRoman(str) {
  let romanString = str;
  var result = 0;
  var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  var roman = ['M', 'CM','D','CD','C', 'XC', 'L', 'XL', 'X','IX','V','IV','I'];
  for (var i = 0; i <= decimal.length; i++) {
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
    var numeral = fromRoman(args[1]);

    // Switch on result and send the right gif
    switch(numeral) {
      default:
      case 1:
        msg.channel.send('https://gfycat.com/gifs/detail/KindlyKeenGrayreefshark');
        break;
      case 2:
        msg.channel.send('https://gfycat.com/gifs/detail/HarmlessBlondIchneumonfly');
        break;
      case 3:
        msg.channel.send('https://gfycat.com/gifs/detail/ElderlyShadowyFishingcat');
        break;
      case 4:
        msg.channel.send('https://gfycat.com/gifs/detail/ThreadbareBareDonkey');
        break;
      case 5:
        msg.channel.send('https://gfycat.com/gifs/detail/MediocreYellowishHapuka');
        break;
      case 6:
        msg.channel.send('https://gfycat.com/gifs/detail/ExhaustedDistantCutworm');
        break;
      case 7:
        msg.channel.send('https://gfycat.com/gifs/detail/FriendlyVengefulJackal');
        break;
      case 8:
        msg.channel.send('https://gfycat.com/gifs/detail/DishonestHorribleGopher');
        break;
      case 9:
        msg.channel.send('https://gfycat.com/gifs/detail/UniformLiquidAlbacoretuna');
        break;
      case 10:
        msg.channel.send('https://gfycat.com/gifs/detail/SparseRevolvingGavial');
        break;
      case 11:
        msg.channel.send('https://gfycat.com/gifs/detail/LongAnchoredFlee');
        break;
      case 12:
        msg.channel.send('https://gfycat.com/gifs/detail/MiserablePhysicalKob');
        break;
      case 13:
        msg.channel.send('https://gfycat.com/gifs/detail/IllustriousFinishedBernesemountaindog');
        break;
      case 14:
        msg.channel.send('https://gfycat.com/gifs/detail/RapidDisfiguredDegus');
        break;
      case 15:
        msg.channel.send('https://gfycat.com/gifs/detail/PiercingSatisfiedAoudad');
        break;
    }
  }
};

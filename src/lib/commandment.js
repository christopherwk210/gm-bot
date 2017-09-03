function fromRoman(str) {
  var result = 0;
  var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  var roman = ["M", "CM","D","CD","C", "XC", "L", "XL", "X","IX","V","IV","I"];
  for (var i = 0;i<=decimal.length;i++) {
    while (str.indexOf(roman[i]) === 0){
      result += decimal[i];
      str = str.replace(roman[i],'');
    }
  }
  return result;
}

const run = function(msg, args) {
  if ((msg.member) && (msg.member.roles)) {
    if (args[1]) {
        var numeral = fromRoman(args[1]);
        switch(numeral) {
            case 1:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/KindlyKeenGrayreefshark');
                break;
            case 2:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/HarmlessBlondIchneumonfly');
                break;
            case 3:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/ElderlyShadowyFishingcat');
                break;
            case 4:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/ThreadbareBareDonkey');
                break;
            case 5:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/MediocreYellowishHapuka');
                break;
            case 6:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/ExhaustedDistantCutworm');
                break;
            case 7:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/FriendlyVengefulJackal');
                break;
            case 8:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/DishonestHorribleGopher');
                break;
            case 9:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/UniformLiquidAlbacoretuna');
                break;
            case 10:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/SparseRevolvingGavial');
                break;
            case 11:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/LongAnchoredFlee');
                break;
            case 12:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/MiserablePhysicalKob');
                break;
            case 13:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/IllustriousFinishedBernesemountaindog');
                break;
            case 14:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/RapidDisfiguredDegus');
                break;
            case 15:
                msg.channel.sendMessage('https://gfycat.com/gifs/detail/PiercingSatisfiedAoudad');
                break;
        }
    }
  } else {
    msg.author.sendMessage('This function is not applicable outside of the /r/GameMaker server.');
  }

};

module.exports.run = run;

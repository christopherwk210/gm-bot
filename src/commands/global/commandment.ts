import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

const command = new SlashCommandBuilder()
.setName('commandment')
.setDescription(`Posts a link to a given Pixelated Pope commandment`)
.addStringOption(option =>
  option
  .setName('roman_numeral')
  .setDescription('The Roman numeral of the commandment you want')
  .setRequired(true)
  .addChoices(
    { name: 'I: Thou shalt read the manual and seek guidance within before thou asks others', value: 'I' },
    { name: 'II: Thou shalt not use Drag and Drop', value: 'II' },
    { name: 'III: Thou shalt manage thy whitespace', value: 'III' },
    { name: 'IV: Thou shalt name thy variables descriptively and consistently', value: 'IV' },
    { name: 'V: Thou shalt not use persistent rooms', value: 'V' },
    { name: 'VI: Thou shalt not use the physics engine if your game does not require a physics simulation', value: 'VI' },
    { name: 'VII: Thou shalt not make your pixel art game any larger than 960x540', value: 'VII' },
    { name: `VIII: Thou shalt not use "object following" for your game's camera`, value: 'VIII' },
    { name: 'IX: Thou shalt use double equals (==) when comparing value', value: 'IX' },
    { name: 'X: Thou shalt not use 1 in place of true nor 0 in place of false', value: 'X' },
    { name: 'XI: Thou shalt not use magic numbers', value: 'XI' },
    { name: 'XII: Thou shalt not use the "self" keyword', value: 'XII' },
    { name: 'XIII: Thou shalt not preemptively worry about performance issues', value: 'XIII' },
    { name: 'XIV: Thou shalt not use the "solid" checkbox, nor the associated scripts', value: 'XIV' },
    { name: 'XV: Thou shalt use the Draw GUI event to draw things relative to your game window', value: 'XV' },
  )
);

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const romanNumeral = interaction.options.getString('roman_numeral')!;

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

  const numeral = fromRoman(romanNumeral);
  await interaction.reply(commandmentURLs[numeral - 1]);
}

/**
 * Convert roman numeral string to number
 */
function fromRoman(str: string) {
  let romanString = str;
  let result = 0;
  let decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  let roman = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  for (let i = 0; i <= decimal.length; i++) {
    while (romanString.indexOf(roman[i]) === 0) {
      result += decimal[i];
      romanString = romanString.replace(roman[i], '');
    }
  }
  return result;
}

export { command, execute };


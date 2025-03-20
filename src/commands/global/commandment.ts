import { SlashCommandBuilder } from 'discord.js';
import { join } from 'path';
import { cjs } from '@/misc/node-utils.js';
const { __dirname } = cjs(import.meta.url);

const command = new SlashCommandBuilder()
.setName('commandment')
.setDescription(`Posts one of the Pixelated Pope commandments`)
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

const commandmentURLs = [
  join(__dirname, '../../../media/commandments/1.gif'),
  join(__dirname, '../../../media/commandments/2.gif'),
  join(__dirname, '../../../media/commandments/3.gif'),
  join(__dirname, '../../../media/commandments/4.gif'),
  join(__dirname, '../../../media/commandments/5.gif'),
  join(__dirname, '../../../media/commandments/6.gif'),
  join(__dirname, '../../../media/commandments/7.gif'),
  join(__dirname, '../../../media/commandments/8.gif'),
  join(__dirname, '../../../media/commandments/9.gif'),
  join(__dirname, '../../../media/commandments/10.gif'),
  join(__dirname, '../../../media/commandments/11.gif'),
  join(__dirname, '../../../media/commandments/12.gif'),
  join(__dirname, '../../../media/commandments/13.gif'),
  join(__dirname, '../../../media/commandments/14.gif'),
  join(__dirname, '../../../media/commandments/15.gif')
];

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

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    const romanNumeral = interaction.options.getString('roman_numeral', true);
    const numeral = fromRoman(romanNumeral);
    await interaction.reply({
      files: [commandmentURLs[numeral - 1]]
    })
    // await interaction.reply(commandmentURLs[numeral - 1]);
  }
};

import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { default as axios } from 'axios';
import { load } from 'cheerio';
import { config } from '../../singletons/config.js';

const command = new SlashCommandBuilder()
.setName('lospec')
.setDescription(`Searches the Lospec Palette List for a given color palette`)
.addStringOption(option =>
  option
  .setName('palette')
  .setDescription('The palette you want to look up')
  .setRequired(true)
);

const lospecURL = 'https://lospec.com/palette-list/';
const paletteNameAlias = [
  {
    alias: ['edg'],
    for: 'endesga'
  },
  {
    alias: ['nes'],
    for: 'nintendo-entertainment-system'
  },
  {
    alias: ['jmp'],
    for: 'jmp-japanese-machine-palette'
  },
  {
    alias: ['dbs8', 'dbs-8', 'dbs 8'],
    for: 'dawnbringers-8-color'
  },
  {
    alias: ['aseprite-default'],
    for: 'dawnbringer-32'
  },
  {
    alias: ['db'],
    for: 'dawnbringer'
  }
];

/**
 * Handles common palette name alias by making replacements to the given name
 * @param paletteName
 */
function handleAlias(paletteName: string): string {
  paletteNameAlias.forEach(aliasMap => {
    aliasMap.alias.forEach(alias => paletteName = paletteName.replace(alias, aliasMap.for));
  });

  return paletteName;
}

async function getPalettePage(palette: string): Promise<string> {
  try {
    const response = await axios.get(lospecURL + palette, { responseType: 'text', timeout: 1000 * 7 });
    if (response.status !== 200) throw new Error('request failed');
    return response.data;
  } catch(e: any) {
    if (e && e.code === 'ECONNABORTED') {
      return 'ECONNABORTED'
    } else {
      return '';
    }
  }
}

function validPalette(html: string) {
  return html && !html.includes('The palette you requested could not be found.') && html !== 'ECONNABORTED';
}

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    interaction.deferReply();

    let palette = handleAlias(
      interaction.options.getString('palette', true)
      .toLowerCase()
      .replace(/\s/g, '-')
    );

    let palettePageHTML = await getPalettePage(palette);
    if (!validPalette(palettePageHTML)) {
      palette = palette.replace(/\d+$/g, '-$&');
      palettePageHTML = await getPalettePage(palette);

      // Okay I give up now
      if (!validPalette(palettePageHTML)) {
        await interaction.editReply({
          content: palettePageHTML === 'ECONNABORTED' ? `Could not reach the Lospec website. The site is either down, or being too slow!` : `${palette.replace(/@/g, '@ ')} palette not found!`
        });
        return;
      }
    }

    // Get page information
    const $ = load(palettePageHTML);
    const paletteInfo = {
      name: $('a.palette-name').text(),
      image: `https://lospec.com${$('#download-png32').attr('href')}`
    };

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
        .setTitle(paletteInfo.name)
        .setColor(config.defaultEmbedColor)
        .setImage(paletteInfo.image)
        .setURL(lospecURL + palette)
      ]
    });
  }
};

import { Message, MessageEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass } from '../../shared';
import { load } from 'cheerio';
import * as https from 'https';

@Command({
  matches: ['palette', 'pallete', 'palete'],
  ...prefixedCommandRuleTemplate
})
export class PaletteCommand implements CommandClass {
  /** Lospec palette page */
  url = 'https://lospec.com/palette-list/';

  /** Contains common palette alias */
  paletteNameAlias: Alias[] = [
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

  async action(msg: Message, args: string[]) {
    if (args.length === 1) return msg.channel.send('Invalid command usage! Proper usage: `!palette [palette_name]`');

    // Get the palette name
    let paletteName = args.slice(1).join('-').toLowerCase();
    paletteName = this.handleAlias(paletteName);

    // Get the palette page
    let palettePageHTML = await this.getPalettePage(paletteName);
    if (!palettePageHTML || (<string>palettePageHTML).includes('The palette you requested could not be found.')) {

      // Attempt to get the page with a separated number before we give up
      paletteName = paletteName.replace(/\d+$/g, '-$&');
      palettePageHTML = await this.getPalettePage(paletteName);

      // Okay I give up now
      if (!palettePageHTML || (<string>palettePageHTML).includes('The palette you requested could not be found.')) {
        return msg.channel.send(`${paletteName.replace(/@/g, '@ ')} palette not found!`);
      }
    }

    // Get page information
    let $ = load(<string>palettePageHTML);
    let paletteInfo = {
      name: $('a.palette-name').text(),
      image: `https://lospec.com${$('#download-png32').attr('href')}`
    };

    // Send as an embed
    msg.channel.send(new MessageEmbed({
      title: paletteInfo.name,
      color: defaultEmbedColor,
      image: {
        url: paletteInfo.image
      },
      url: this.url + paletteName
    }));
  }

  /**
   * Handles common palette name alias by making replacements to the given name
   * @param paletteName
   */
  handleAlias(paletteName: string): string {
    this.paletteNameAlias.forEach(aliasMap => {
      aliasMap.alias.forEach(alias => paletteName = paletteName.replace(alias, aliasMap.for));
    });

    return paletteName;
  }

  /**
   * Returns a lospec palette page as HTML
   * @param palette Palette name
   */
  getPalettePage(palette: string): Promise<string | boolean> {
    let chunks: string[] = [];
    return new Promise(resolve => {
      https.get(this.url + palette, res => {
        res.setEncoding('utf8');
        res.on('data', data => chunks.push(data.toString()));
        res.on('end', () => resolve(chunks.join('')));
        res.on('error', err => resolve(false));
      }).end();
    });
  }
}

interface Alias {
  /** All alias to match */
  alias: string[];

  /** What the alias reference to */
  for: string;
}

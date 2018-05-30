import { Message, RichEmbed } from 'discord.js';
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

  async action(msg: Message, args: string[]) {
    if (args.length === 1) return msg.channel.send('Invalid command usage$! Proper usage: `!palette [palette_name]`');

    // Get the palette name
    let paletteName = args.slice(1).join('-').toLowerCase();

    // Get the palette page
    let palettePageHTML = await this.getPalettePage(paletteName);
    if (!palettePageHTML || !!~(<string>palettePageHTML).indexOf('The palette you requested could not be found.')) {
      return msg.channel.send('Palette not found!');
    }

    // Get page information
    let $ = load(<string>palettePageHTML);
    let paletteInfo = {
      name: $('a.palette-name').text(),
      image: `https://lospec.com${$('#download-png32').attr('href')}`
    };

    // Send as an embed
    msg.channel.send(new RichEmbed({
      title: paletteInfo.name,
      color: defaultEmbedColor,
      image: {
        url: paletteInfo.image
      },
      url: this.url + paletteName
    }));
  }

  /**
   * Returns a lospec palette page as HTML
   * @param palette Palette name
   */
  getPalettePage(palette: string): Promise<string|boolean> {
    let chunks = [];
    return new Promise(resolve => {
      https.get(this.url + palette, res => {
        res.setEncoding('utf8');
        res.on('data', data => chunks.push(data));
        res.on('end', () => resolve(chunks.join('')));
        res.on('error', err => resolve(false));
      }).end();
    });
  }
}

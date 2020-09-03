import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

import {
  hexToRgb,
  parseHex,
  rgbToHsv,
  rgbToHex,
  hsvToRgb
} from './color-utils';

@Command({
  matches: ['#'],
  ...prefixedCommandRuleTemplate,
  delete: false,
  dontAppendSpace: true
})
export class ColorCommand implements CommandClass {
  gmlRGBbase = 'make_colour_rgb';
  gmlHSVbase = 'make_colour_hsv';

  /**
   * Command action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  async action(msg: Message, args: string[]) {
    const content = msg.content.replace('!', '');
    const isColorHex = content.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g);
    if (!isColorHex) return await msg.channel.send(`Hey, ${content} isn't a valid hex color code.`);

    // https://github.com/christopherwk210/tophers-tools/tree/master/src/app/components/tools/game-maker/color-picker
    const parsedHex = parseHex(content);
    const gmlHex = `$${parsedHex.b}${parsedHex.g}${parsedHex.r}`;
    const gmlRaw = parseInt(parsedHex.b + parsedHex.g + parsedHex.r, 16);

    const rgb = hexToRgb(content);
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];

    const hsv = rgbToHsv(r, g, b);
    const h = hsv[0];
    const s = hsv[1];
    const v = hsv[2];

    const gmlHSV = `${this.gmlHSVbase}(${h}, ${s}, ${v})`;
    const gmlRGB = `${this.gmlRGBbase}(${r}, ${g}, ${b})`;

    const embed = new RichEmbed({
      url: 'https://chrisanselmo.com/tools/#/gm/color-picker',
      color: parseInt(content.replace('#', ''), 16),
      title: content,
      fields: [
        {
          name: 'GML Hex',
          value: gmlHex,
          inline: true
        },
        {
          name: 'GML Raw',
          value: `${gmlRaw}`,
          inline: true
        },
        {
          name: 'GML HSV',
          value: gmlHSV,
          inline: false
        },
        {
          name: 'GML RGB',
          value: gmlRGB,
          inline: false
        }
      ]
    });

    await msg.channel.send(embed);
  }
}

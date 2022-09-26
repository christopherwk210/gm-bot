import { devMode } from './environment.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cjs } from '../misc/node-utils.js';
const { require, __dirname } = cjs(import.meta.url);

const GameMakerDiscordGuildID = '262834612932182025';
const devIdsExists = existsSync(join(__dirname, '../dev-ids.json'));

const discordIds = {
  guildId: GameMakerDiscordGuildID,
  emojis: {
    duckycode: '<:duckycode:402920261340626954>'
  },
  channels: {
    /** This channel is used for debug bot output and bot testing */
    botChannel: '417796218324910094',

    /** Channel used for security alerts, like user joins */
    securityChannel: '492767948155518976',

    helpChannels: [
      '262836222089625602',
      '295210810823802882',
      '331106795378442240',
      '490232902110674964',
      '880010995270033458'
    ]
  }
};

const devIds: typeof discordIds = devMode && devIdsExists ? require('../dev-ids.json') : {} as any;

export const config = {
  defaultEmbedColor: 0x039e5c,
  discordIds: {
    ...discordIds,
    ...devIds
  }
};

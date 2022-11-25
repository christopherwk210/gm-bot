import { devMode } from './environment.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cjs } from '@/misc/node-utils.js';
const { require, __dirname } = cjs(import.meta.url);

const GameMakerDiscordGuildID = '262834612932182025';
const devIdsExists = existsSync(join(__dirname, '../dev-ids.json'));

const discordIds = {
  guildId: GameMakerDiscordGuildID,
  emojis: {
    duckycode: '<:duckycode:402920261340626954>',
    ask: '<:ask:841517748534247475>',
    hehim: '<:hehim:841517748558888991>',
    theythem: '<:theythem:841517748899151902>',
    sheher: '<:sheher:841535247140388895>'
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
    ],
  },
  channelCategories: {
    help: '515535429336825867',
    helpBusy: '1040679011216543755'
  },
  roles: {
    duckyCode: '262926334118985728',
    duckyHonourary: '390437904859660290',
    duckyArt: '345222078577901569',
    duckyAudio: '398875444360904704',
    serverStaff: '324536542737727488',
    communityCats: '700373416502624326',

    birthday: '381386952903098368',

    pronouns: {
      heHim: '828824988848881694',
      sheHer: '828825023279792148',
      theyThem: '828825054942724206',
      ask: '828825088106561606'
    },

    christmas: {
      A: '926957515818811442',
      B: '926957504561287208',
      C: '926957611708993577'
    }
  }
};

const devIds: typeof discordIds = devMode && devIdsExists ? require('../dev-ids.json') : {} as any;

export const config = {
  helpChannelBusyTimeout: 60_000 * 10, // 10 minutes
  defaultEmbedColor: 0x039e5c,
  discordIds: {
    ...discordIds,
    ...devIds
  }
};

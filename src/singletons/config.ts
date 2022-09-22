import { testingGuild, devMode } from './environment.js';

const GameMakerDiscordGuildID = '262834612932182025';

export const config = {
  defaultEmbedColor: 0x039e5c,

  /** How long to wait before considering a help channel no longer busy, in milliseconds */
  helpChannelBusyTimeout: 1000,
  // helpChannelBusyTimeout: 1000 * 60 * 10,

  discordIds: {
    guildId: devMode ? testingGuild || GameMakerDiscordGuildID : GameMakerDiscordGuildID,
    emojis: {
      duckycode: '<:duckycode:402920261340626954>'
    },
    channels: {
      /** This channel is used for debug bot output and bot testing */
      botChannel: '417796218324910094',

      helpChannels: [
        '262836222089625602',
        '295210810823802882',
        '331106795378442240',
        '490232902110674964',
        '880010995270033458',

        // temp
        '859987608943460364'
      ]
    }
  }
};

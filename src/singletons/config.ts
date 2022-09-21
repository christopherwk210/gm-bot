import { testingGuild, devMode } from './environment.js';

const GameMakerDiscordGuildID = '262834612932182025';

export const config = {
  discordIds: {
    guildId: devMode ? testingGuild || GameMakerDiscordGuildID : GameMakerDiscordGuildID,
    channels: {
      /** This channel is used for debug bot output and bot testing */
      botChannel: '417796218324910094'
    }
  }
};

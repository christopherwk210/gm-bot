import { testingGuild, devMode } from './environment.js';

const GameMakerDiscordGuildID = '262834612932182025';

export const config = {
  discordIds: {
    guildId: devMode ? testingGuild || GameMakerDiscordGuildID : GameMakerDiscordGuildID
  }
};

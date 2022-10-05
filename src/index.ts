import { ActivityType, codeBlock, inlineCode } from 'discord.js';

import { auth } from './database/db.js';
import { login } from './singletons/client.js';
import { getCommands } from './singletons/commands.js';
import { config } from './data/config.js';
import { devMode } from './data/environment.js';
import { getTextChannel } from './misc/discord-utils.js';
import { setupBirthdayTicker } from './misc/birthday-ticker.js';

console.clear();

// Sync all slash commands with remote
console.log('Syncing commands...');
await getCommands();

console.log('Setting up database...');
await auth();

console.log('Logging in...');
const client = await login();

console.log('Setting up timers...');
setupBirthdayTicker(client);

console.log('GameMakerBot is ready.');

client.on('raw', gatewayEvent => {
  if (gatewayEvent.op === 4000) {
    console.log('Got unknown gateway error');
    process.exit(1);
  }
});

if (devMode && client.user) {
  client.user.setStatus('idle');
  client.user.setActivity('coming soon...', { type: ActivityType.Playing });
}

// Log exceptions via discord
process.on('uncaughtException', async err => {
  const botTestingChannel = await getTextChannel(config.discordIds.channels.botChannel);
  if (!botTestingChannel) return;

  const errorMessageCode = inlineCode(err.message);
  const stackTraceCodeBlock = err.stack ? codeBlock(err.stack) : '';
  const errorMessage =
    `GameMakerBot has encoutered an uncaught exception:\n\n` +
    `${errorMessageCode}\n${stackTraceCodeBlock}`;

  await botTestingChannel.send(errorMessage);
  console.log(`\n${errorMessage}\n`);

  process.exit(-1);
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

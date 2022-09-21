import { ActivityType, codeBlock } from 'discord.js';
import { fetchChannel } from './discord-utils.js';
import { login } from './singletons/client.js';
import { getCommands } from './singletons/commands.js';
import { devMode } from './singletons/environment.js';

console.clear();

// Sync all slash commands with remote
console.log('Syncing commands...');
await getCommands();
console.log('Done.');

// Create a new client instance
console.log('Logging in...');
const client = await login();
console.log('GameMakerBot is ready.');

if (devMode && client.user) {
  client.user.setStatus('idle');
  client.user.setActivity('coming soon...', { type: ActivityType.Playing });
}

// Log exceptions via discord
process.on('uncaughtException', async err => {
  const botTestingChannel = await fetchChannel('botChannel');
  if (!botTestingChannel || !botTestingChannel.isTextBased()) return;

  const errorCodeBlock = codeBlock(err.message);
  const stackTraceCodeBlock = err.stack ? codeBlock(err.stack) : '';
  const errorMessage =
    `GameMakerBot has encoutered an uncaught exception:\n` +
    `${errorCodeBlock}\n${stackTraceCodeBlock}`;

  await botTestingChannel.send(errorMessage);
  console.log(`\n${errorMessage}\n`);

  process.exit(-1);
});

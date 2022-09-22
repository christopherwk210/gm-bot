import { ActivityType, codeBlock, inlineCode } from 'discord.js';
import { initHelpChannelHandler } from './message-handlers/help-channel-handler.js';
import { login } from './singletons/client.js';
import { getCommands } from './singletons/commands.js';
import { config } from './singletons/config.js';
import { devMode } from './singletons/environment.js';

console.clear();

// Sync all slash commands with remote
console.log('Syncing commands...');
await getCommands();

// Create a new client instance
console.log('Logging in...');
const client = await login();
console.log('GameMakerBot is ready.');

initHelpChannelHandler(client);

if (devMode && client.user) {
  client.user.setStatus('idle');
  client.user.setActivity('coming soon...', { type: ActivityType.Playing });
}

// Log exceptions via discord
process.on('uncaughtException', async err => {
  const botTestingChannel = await client.channels.fetch(config.discordIds.channels.botChannel).catch(() => null);
  if (!botTestingChannel || !botTestingChannel.isTextBased()) return;

  const errorMessageCode = inlineCode(err.message);
  const stackTraceCodeBlock = err.stack ? codeBlock(err.stack) : '';
  const errorMessage =
    `GameMakerBot has encoutered an uncaught exception:\n\n` +
    `${errorMessageCode}\n${stackTraceCodeBlock}`;

  await botTestingChannel.send(errorMessage);
  console.log(`\n${errorMessage}\n`);

  process.exit(-1);
});

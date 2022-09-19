import { ActivityType } from 'discord.js';
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
  client.user.setActivity('coming soon...', { type: ActivityType.Playing })
}

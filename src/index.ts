import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { syncAllCommands } from './command-management.js';
import { token, devMode } from './environment.js';
import { handleErrors } from './utils.js';

console.clear();

// Sync all slash commands with remote
console.log('Syncing commands...');
const syncResult = await syncAllCommands();
if (!syncResult.data) throw syncResult.err;
const commands = syncResult.data!;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('GameMakerBot is ready.');

  if (devMode && client.user) {
    client.user.setStatus('idle');
    client.user.setActivity('coming soon...', { type: ActivityType.Playing })
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const commandsCollection = interaction.inGuild() ? commands.guild.concat(commands.global) : commands.global;
	const command = commandsCollection.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
    if (!interaction.replied) handleErrors(interaction);
	} catch (error) {
		console.error(`Error executing command "${command.command.name}":`, error);
    handleErrors(interaction);
	}
});

client.login(token);

import { Client, GatewayIntentBits } from 'discord.js';
import { token } from './environment.js';
import { onInteractionCreate } from '../client-events/interaction-create.js';
import { onMessageCreate } from '../client-events/message-create.js';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

client.on('interactionCreate', onInteractionCreate);
client.on('messageCreate', onMessageCreate);

/**
 * Logs in the client using the bot token, resolves
 * once bot reports that it is ready
 */
export function login(): Promise<Client<boolean>> {
  return new Promise(resolve => {
    client.once('ready', () => resolve(client!));
    client.login(token);
  });
}

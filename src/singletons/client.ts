import { Channel, Client, GatewayIntentBits } from 'discord.js';
import { token } from '@/data/environment.js';

import { onInteractionCreate } from '@/client-events/interaction-create.js';
import { onMessageCreate } from '@/client-events/message-create.js';
import { onGuildMemberAdd } from '@/client-events/guild-member-add.js';
import { onMessageReactionAdd } from '@/client-events/message-reaction-add.js';
import { onMessageReactionRemove } from '@/client-events/message-reaction-remove.js';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ]
});

client.on('interactionCreate', onInteractionCreate);
client.on('messageCreate', onMessageCreate);
client.on('guildMemberAdd', onGuildMemberAdd);
client.on('messageReactionAdd', onMessageReactionAdd);
client.on('messageReactionRemove', onMessageReactionRemove);

client.on('error', error => { throw error });
client.on('debug', message => console.log(`[DEBUG] ${message}`));
client.on('rateLimit', data => console.log(`[RATE_LIMIT]`, data));

// This is to handle emoji reactions on uncached messages
client.on('raw', async packet => {

  // We don't want this to run on unrelated packets
  if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

  // Grab the channel to check the message from
  let channel: Channel | null | undefined = client.channels.cache.get(packet.d.channel_id);

  // Fetch the channel if it isn't cached
  if (!channel) channel = await client.channels.fetch(packet.d.channel_id);
  if (!channel) return;

  // Exit early if the channel isn't a text channel
  if (!channel!.isTextBased()) return;

  // There's no need to emit if the message is cached, because the event will fire anyway for that
  if (channel!.isTextBased() && channel.messages.cache.has(packet.d.message_id)) return;

  // Since we have confirmed the message is not cached, let's fetch it
  const message = await channel.messages.fetch(packet.d.message_id);

  // Emojis can have identifiers of name:id format, so we have to account for that case as well
  const emoji: string = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;

  // This gives us the reaction we need to emit the event properly, in top of the message object
  const reaction = message.reactions.cache.get(emoji);

  // Get the user from the cache
  const user = client.users.cache.get(packet.d.user_id);

  // Proceed if we have everything we need
  if (reaction && user) {

    // Adds the currently reacting user to the reaction's users collection.
    reaction.users.cache.set(packet.d.user_id, user);

    // Check which type of event it is before emitting
    if (packet.t === 'MESSAGE_REACTION_ADD') {
      client.emit('messageReactionAdd', reaction, user);
    } else if (packet.t === 'MESSAGE_REACTION_REMOVE') {
      client.emit('messageReactionRemove', reaction, user);
    }
  }
});

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

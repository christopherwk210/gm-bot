import { Message } from 'discord.js';

export async function handleMisc(message: Message<boolean>) {
  if (message.content === 'nice' && message.author.id === '144913457429348352') {
    await message.channel.send('nice');
  }
}

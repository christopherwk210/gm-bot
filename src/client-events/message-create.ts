import { Message, Routes } from 'discord.js';
import { handleExplodeCommandMessages } from '@/message-handlers/explode-handler.js';
import { handleHasteCodeBlockMessages } from '@/message-handlers/haste-code-block.js';
import { reactToMessage } from '@/message-handlers/reaction-handler.js';
import { handleWrongCodeBlockMessages } from '@/message-handlers/wrong-code-block.js';
import { handleMisc } from '@/message-handlers/misc-handlers.js';

import { REST } from '@discordjs/rest';
import { token } from '@/data/environment.js';
const restClient = () => new REST({ version: '8' }).setToken(token);
const route = Routes.channel('417796218324910094');

export async function onMessageCreate(message: Message<boolean>) {
  if (message.author.bot) return;
  
  if (await handleExplodeCommandMessages(message)) return;
  await handleHasteCodeBlockMessages(message);
  await handleWrongCodeBlockMessages(message);
  await reactToMessage(message);
  await handleMisc(message);

  if (message.content === '__!!~') {
    const rest = restClient();
    const result = await rest.patch(route, {
      body: {
        name: 'bot_testing_'+Math.floor(Math.random()*100)
      }
    });
    console.log(result);
  }
}

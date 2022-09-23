import { Message } from 'discord.js';
import { handleExplodeCommandMessages } from '../message-handlers/explode-handler.js';

export async function onMessageCreate(message: Message<boolean>) {
  handleExplodeCommandMessages(message);
}

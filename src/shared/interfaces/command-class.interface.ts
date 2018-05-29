import { Message } from 'discord.js';
import { TextChannelMessage } from './rule.interface';

export interface CommandClass {
  /**
   * Callback function that is triggered when message satsifies match requirements
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  action(msg: Message | TextChannelMessage, args: string[]);

  /**
   * Prevalidation callback which is called every message after a match is found
   * @param msg Original discord message
   * @param args Message contents, split on space character
   * @returns Truthy value denotes validation passed, and action will be called
   */
  pre?(msg: Message | TextChannelMessage, args: string[]): boolean;
}

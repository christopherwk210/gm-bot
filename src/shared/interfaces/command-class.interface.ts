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
   * Prevalidation callback which is called every message after a match is found.
   * If a truthy value is returned, it will call the rule action. Useful for determining
   * if a user has permission or not.
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  pre?(msg: Message, args: string[]): boolean;
}

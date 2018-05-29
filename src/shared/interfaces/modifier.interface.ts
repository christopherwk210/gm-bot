import { Message } from 'discord.js';
import { TextChannelMessage } from '..';

export interface ModifierClass {
  /**
   * Callback function that is triggered every time a code block with the modifier match is found
   * @param msg Original discord message
   * @param contents Contents of all matched code blocks
   * @param match Modifier match string
   */
  action(msg: Message | TextChannelMessage, contents: string[], match: string);

  /**
   * Prevalidation callback which is called every time a code block with the modifier match is found
   * @param msg Original discord message
   * @param contents Contents of all matched code blocks
   * @param match Modifier match string
   * @returns Truthy value denotes validation passed, and action will be called
   */
  pre?(msg: Message | TextChannelMessage, contents: string[], match: string): boolean;
}

export interface ModifierOptions {
  /** Code block language to match for this modifier */
  match: string;

  /** Whether or not to delete the matched message (after calling the action) */
  delete?: boolean;
}

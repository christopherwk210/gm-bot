import { Message, TextChannel } from 'discord.js';

export interface RuleOptions {
  /** All synonyms for this command */
  matches: string[];

  /** The prefix for this command, to match before any of the matches */
  prefix?: string;

  /** Position to check for the match, if omitted, match anywhere */
  position?: number;

  /** If true, overrides position and compares the entire string */
  wholeMessage?: boolean;

  /** If omitted or true, it will match case-sensitively */
  exact?: boolean;

  /** Whether or not to delete a matched message (after calling the action) */
  delete?: boolean;
}

export interface Rule extends RuleOptions {
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
};

export interface TextChannelMessage extends Message {
  channel: TextChannel;
}

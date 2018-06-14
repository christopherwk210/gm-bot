import { Message } from 'discord.js';
import { Type, Rule } from '..';

/**
 * Parses a command list against a discord message
 * @param commandList List of valid command rules
 * @param msg Discord message
 * @returns True if command was matched and executed
 */
export function parseCommandList(commandList: (Rule | Type<any>)[], msg: Message) {
  let messageContent = msg.content;
  let args = messageContent.split(' ');

  return commandList.some((command: Rule) => handleRuleOrCommand(command, msg, messageContent, args));
}

/**
 * Matches a command or rule against a message and executes if matched
 * @param command Command or rule to match and execute
 * @param msg Message to execute on
 * @param messageContent Contents of the message
 * @param args Message contents, split on space character
 */
function handleRuleOrCommand(command: Rule | Type<any>, msg: Message, messageContent: string, args: string[]): boolean {
  // Handle both rules and commands
  let cmd = (typeof command === 'function') ?
    new command() :
    { action: command.action, pre: command.pre };

  let rules: Rule = (typeof command === 'function') ?
    { ...command.prototype._rules } :
    command;

  let success = false;

  // Iterate over matches
  rules.matches.some(currentMatch => {
    let match = currentMatch;

    // Use prefix if specified
    if (rules.prefix) match = rules.prefix + match;

    // Move everything to uppercase if we don't care about exact matching
    if (rules.exact !== undefined && !rules.exact) {
      messageContent = messageContent.toUpperCase();
      match = match.toUpperCase();
    }

    // Determine our condition
    let condition;
    if (rules.wholeMessage) {
      condition = messageContent === match;
    } else {
      condition = (rules.position === undefined) ?
        messageContent.indexOf(match) !== -1 :
        messageContent.indexOf(match) === rules.position;
    }

    // Match made
    if (condition) {
      // Ensure prevalidation passes if present
      if (cmd.pre && !cmd.pre(msg, args)) return true;

      // Execute command action
      cmd.action(msg, args);

      // Delete message if specified
      if (rules.delete) msg.delete();

      return success = true;
    }
  });

  return success;
}

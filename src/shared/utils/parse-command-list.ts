import { Message } from 'discord.js';
import { Type, Rule } from '..';

/**
 * Parses a command list against a discord message
 * @param commandList List of valid command rules
 * @param msg Discord message
 * @returns True if command was matched and executed
 */
export function parseCommandList(commandList: (Rule|Type<any>)[], msg: Message) {
  let messageContent = msg.content;
  let args = messageContent.split(' ');

  let success = false;

  // Iterate over commands
  commandList.some((command: Rule) => {

    success =
      typeof command === 'function' ?
      handleCommand(command, msg, messageContent, args) :
      handleRule(command, msg, messageContent, args);

    // Short circuit iteration if needed
    return success;
  });

  return success;
};

/**
 * Matches a rule against a message and executes if matched
 * @param command Rule to match and execute
 * @param msg Message to execute on
 * @param messageContent Contents of the message
 * @param args Message contents, split on space character
 */
function handleRule(command: Rule, msg: Message, messageContent: string, args: string[]): boolean {
  let success = false;

  // Iterate over matches
  command.matches.some(currentMatch => {
    let match = currentMatch;

    // Use prefix if specified
    if (command.prefix) {
      match = command.prefix + match;
    }
    
    // Move everything to uppercase if we don't care about exact matching
    if ((command.exact !== undefined) && (!command.exact)) {
      messageContent = messageContent.toUpperCase();
      match = match.toUpperCase();
    }

    // Determine our condition
    let condition;
    if (command.wholeMessage) {
      condition = messageContent === match;
    } else {
      condition = command.position === undefined ? messageContent.indexOf(match) !== -1 : messageContent.indexOf(match) === command.position;
    }

    // Match made
    if (condition) {
      // Validate pre callback
      if (command.pre) {
        if (!command.pre(msg, args)) {

          // Pre invalidated, short circuit
          return true;
        }
      }

      // Execute command action
      command.action(msg, args);

      // Delete message if specified
      if (command.delete) {
        msg.delete();
      }

      return success = true;
    }
  });

  return success;
}

/**
 * Matches a command class against a message and executes if matched
 * @param Command Command to match and execute
 * @param msg Message to execute on
 * @param messageContent Contents of the message
 * @param args Message contents, split on space character
 */
function handleCommand(Command: Type<any>, msg: Message, messageContent: string, args: string[]): boolean {
  // Create new instance of command
  let cmd = new Command();

  // "Cast" rule options
  let rules: Rule = {
    ...Command.prototype._rules,
  };

  let success = false;

  // Iterate over matches
  rules.matches.some(currentMatch => {
    let match = currentMatch;

    // Use prefix if specified
    if (rules.prefix) {
      match = rules.prefix + match;
    }
    
    // Move everything to uppercase if we don't care about exact matching
    if ((rules.exact !== undefined) && (!rules.exact)) {
      messageContent = messageContent.toUpperCase();
      match = match.toUpperCase();
    }

    // Determine our condition
    let condition;
    if (rules.wholeMessage) {
      condition = messageContent === match;
    } else {
      condition = rules.position === undefined ? messageContent.indexOf(match) !== -1 : messageContent.indexOf(match) === rules.position;
    }

    // Match made
    if (condition) {
      // Ensure prevalidation passes if present
      if (cmd.pre && !cmd.pre(msg, args)) return true;

      // Execute command action
      cmd.action(msg, args);

      // Delete message if specified
      if (rules.delete) {
        msg.delete();
      }

      return success = true;
    }
  });

  return success;
}

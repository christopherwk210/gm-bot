import { Message } from "discord.js";

/**
 * Parses a command list against a discord message
 * @param commandList List of valid command rules
 * @param msg Discord message
 */
export function parseCommandList(commandList: any[], msg: Message) {
  let messageContent = msg.content;
  let success = false;

  // Get command arguments
  let args = messageContent.split(' ');

  // Iterate over commands
  commandList.some(command => {
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
          msg.delete().catch(() => {});
        }

        // Short circuit iteration
        success = true;
        
        return true;
      }
    });

    // Short circuit iteration if needed
    return success;
  });

  return success;
};

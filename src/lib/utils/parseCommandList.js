/**
 * Parses a command list against a discord message
 * @param {Array<object>} commandList List of valid command rules
 * @param {Message} msg Discord message
 */
module.exports = function(commandList, msg) {
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
        condition = command.position ? messageContent.indexOf(match) === command.position : messageContent.indexOf(match) !== -1;
      }

      // Match made
      if (condition) {
        // Validate pre callback
        if (command.pre) {
          if (!command.pre(msg)) {
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
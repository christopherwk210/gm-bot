/**
 * Parses a command list against a discord message
 * @param {Array<object>} commandList List of valid command rules
 * @param {Message} msg Discord message
 */
module.exports = function(commandList, msg) {
  let messageContent = msg.content;
  let success = false;

  // Iterate over commands
  commandList.some(command => {
    command.matches.some(currentMatch => {
      let match = currentMatch;

      // Use prefix if specified
      if (command.prefix) {
        match = prefix + match;
      }
      
      // Move everything to uppercase if we don't care about exact matching
      if ((command.exact !== undefined) && (!command.exact)) {
        messageContent = messageContent.toUpperCase();
        match = match.toUpperCase();
      }

      // We are checking absolute content match
      if (command.wholeMessage) {
        if (messageContent === match) {
          // Execute command action
          command.action(msg);

          // Short circuit iteration
          return true;
          success = true;
        }
      } else {
        // Match command position or anywhere by default
        if (command.position ? messageContent.indexOf(match) === command.position : messageContent.indexOf(match) !== -1) {
          // Execute command action
          command.action(msg);
          
          // Short circuit iteration
          return true;
          success = true;
        }
      }
    });

    // Short circuit iteration
    return success;
  });
}
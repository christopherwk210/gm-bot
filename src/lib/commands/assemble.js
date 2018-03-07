/**
 * Ping the rubber duckies role
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
 */
module.exports = function(msg, args) {
  // Make sure this is in the server
  if ((msg.member) && (msg.member.roles)) {

    // Make sure nothing else was included with the message
    if (args.length === 1) {

      // If a guild is present (redundant)
      if (msg.guild) {

        // Grab the duck roles
        let ducks = msg.guild.roles.find('id', '262926334118985728');
        let audio = msg.guild.roles.find('id', '398875444360904704');
        let art = msg.guild.roles.find('id', '345222078577901569');

        ducks.setMentionable(true)
        .then(() => audio.setMentionable(true))
        .then(() => art.setMentionable(true))

        .then(() => msg.channel.send(`${ducks}, ${audio}, ${art}; Assemble!`))
        
        .then(() => ducks.setMentionable(false))
        .then(() => audio.setMentionable(false))
        .then(() => art.setMentionable(false))
        .catch(() => {});
      }
    }
  }
};

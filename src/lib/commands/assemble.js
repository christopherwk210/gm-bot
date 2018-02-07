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

        // Grab the duck role
        let ducks = msg.guild.roles.find('id', '345222443012587520');

        // Make them mentionable
        ducks.setMentionable(true).then(r => {

          // Mention!
          msg.channel.send(`${r} assemble!`).then(() => {

            // Unmention!
            r.setMentionable(false).catch(() => {});
          }).catch(() => {});
        }).catch(() => {});
      }
    }
  }
};

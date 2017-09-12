/**
 * Ping the rubber duckies role
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
 */
module.exports = function(msg, args) {
  // Make sure this is in the server
  if ((msg.member) && (msg.member.roles)) {
    // Make sure the calling author is an admin or duck
    if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins') || msg.member.roles.find('name', 'rubber duckies')) {
      // Make sure nothing else was included with the message
      if (args.length === 1) {
        // If a guild is present (redundant)
        if (msg.guild) {
          // Grab the duck and art duck roles
          let ducks = msg.guild.roles.find('name', 'rubber duckies');
          let artducks = msg.guild.roles.find('name', 'art duckies');

          // Make them mentionable
          ducks.setMentionable(true).then(r => {
            artducks.setMentionable(true).then(a => {
              // Mention them!
              msg.channel.send(`${r} and ${a} assemble!`).then(m => {
                // Make them unmentionable again
                r.setMentionable(false).catch(() => {});
                a.setMentionable(false).catch(() => {});
              }).catch(() => {});
            }).catch(() => {});
          }).catch(() => {});
        }
      }  
    }
  }
};

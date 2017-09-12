const assemble = function(msg, args) {
  if ((msg.member) && (msg.member.roles)) {
    if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins') || msg.member.roles.find('name', 'rubber duckies')) {
      if (args.length === 1) {
        if (msg.guild) {
          let ducks = msg.guild.roles.find('name', 'rubber duckies');
          let artducks = msg.guild.roles.find('name', 'art duckies');
          ducks.setMentionable(true).then(r => {
            artducks.setMentionable(true).then(a => {
              msg.channel.sendMessage(`${r} and ${a} assemble!`).then(m => {
                r.setMentionable(false).catch(console.error);
                a.setMentionable(false).catch(console.error);
              }).catch(console.error);
            }).catch(console.error);
          }).catch(console.error);
        }
      }  
    }
  }
};

module.exports.assemble = assemble;

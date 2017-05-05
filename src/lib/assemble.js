const assemble = function(msg, args) {
  if ((msg.member) && (msg.member.roles)) {
    if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins') || msg.member.roles.find('name', 'rubber duckies')) {
      if (args.length === 1) {
        if (msg.guild) {
          let ducks = msg.guild.roles.find('name', 'rubber duckies');
          ducks.setMentionable(true).then(r => {
            msg.channel.sendMessage(`${r} assemble!`).catch(console.error);;
            // r.setMentionable(false).catch(console.error);
          }).catch(console.error);
        }
      }  
    }
  }
};

module.exports.assemble = assemble;

const assemble = function(msg, args) {
  console.log(msg);
  console.log(args);
  if ((msg.member) && (msg.member.roles)) {
    if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins') || msg.member.roles.find('name', 'rubber duckies')) {
      if (args.length === 1) {
        if (msg.guild) {
          let ducks = msg.guild.roles.find('name', 'rubber ducks');
          ducks.setMentionable(true).then(r => {
            msg.channel.sendMessage('@rubber_duckies assemble!').catch(console.error);;
            ducks.setMentionable(false).catch(console.error);
          }).catch(console.error);
        }
      }  
    }
  }
};

module.exports.assemble = assemble;

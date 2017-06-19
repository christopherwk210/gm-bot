const run = function(msg, args) {
  if ((msg.member) && (msg.member.roles)) {

    let alreadyHas = false;
    let streamerRole;
    msg.member.guild.roles.forEach(role => {
      if (role.name.indexOf('stream') !== -1) {
        streamerRole = role.id;
        alreadyHas = true;
      }
    });

    if (alreadyHas) {
      msg.member.removeRole(streamerRole).then(res => {
        //console.log(res)
      }, err => {
        //console.log(err)
      });
    } else {
      msg.member.addRole( streamerRole ).then(res => {
        //console.log(res);
      }, err => {
        //console.log(err);
      });
    }
  } else {
    msg.author.sendMessage('This function is not applicable outside of the /r/GameMaker server.');
  }

};

module.exports.run = run;

const run = function(msg, args) {

  if ((msg.member) && (msg.member.roles)) {
    if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins')) {
      if (args[1]) {
        let id = args[1].replace(/([<>@])/g, '');
        let user = msg.member.guild.members.get(id);
        if (user) {
          let birthdayRole;
          msg.member.guild.roles.forEach(role => {
            if (role.name.indexOf('birthday') !== -1) {
              birthdayRole = role.id;
            }
          });
          user.addRole( birthdayRole );
        } else {
          msg.author.sendMessage('An error occurred with your request... Did you mention a valid user?');
        }
      } else {
        msg.author.sendMessage('You didn\'t provide a user to birthdayify.');
      }
    } else {
      msg.author.sendMessage('You don\'t have permission to do that, silly!');
    }
  } else {
    msg.author.sendMessage('This function is not applicable outside of the /r/GameMaker server.');
  }

};

module.exports.run = run;

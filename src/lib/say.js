const run = function(msg, args) {
  if ((msg.member) && (msg.member.roles)) {
    if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins')) {
      let saying = msg.content.replace('!say ', '');
      msg.channel.sendMessage(saying).catch(err => console.log(err));
    }
  }
};

module.exports.run = run;

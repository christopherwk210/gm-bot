const run = function(msg, args) {
  if ((msg.member) && (msg.member.roles)) {
    if (msg.member.roles.find('name', 'admin')) {
      if (args[1]) {
        msg.channel.sendMessage(args[1]).catch(err => console.log(err));
      }
    }
  }
};

module.exports.run = run;

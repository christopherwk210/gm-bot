const fs = require("fs");
const resources = fs.readFileSync('./src/assets/markdown/resources.md', 'utf8');

const run = function(msg, args) {
  if ((msg.member) && (msg.member.roles)) {
    if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'rubber duckies')) {
      if (args[1]) {
        let id = args[1].replace(/([<>@])/g, '');
        let user = msg.member.guild.members.get(id);
        if (user) {
          user.sendMessage(resources);
        } else {
          msg.author.sendMessage('An error occurred with your request... Did you mention a valid user?');
        }
      } else {
        msg.author.sendMessage(resources);
      }
    } else {
      msg.author.sendMessage(resources);
    }
  } else {
    msg.author.sendMessage(resources);
  }
};

module.exports.run = run;

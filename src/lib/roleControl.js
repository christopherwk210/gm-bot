const control = {
  toggleRole: function(msg, roleName) {
    let role = this.getRole(msg.guild.roles, roleName);

    switch (role) {
      case "ducky":
        this.ducky(msg.author);
        break;
      case "noone":
        msg.author.sendMessage("That is not a valid role");
        break;
      default:
        if (msg.member.roles.has(role.id)) {
          msg.member.removeRole(role);
          msg.author.sendMessage("Role " + role.name + " was removed.");
        } else {
          msg.member.addRole(role);
          msg.author.sendMessage("Role " + role.name + " has been granted.");
        }
        break;
    }
  },
  getRole: (roles, roleName) => {
    if (!roleName[0]) {
      return 'noone';
    }

    switch (roleName[0].toUpperCase()) {
      case "VOIP":
        return roles.find("name", "voip_text");
        break;
      case "QUACK":
      case "DUCKY":
        return "ducky";
        break;
      default:
        return "noone";
        break;
    }
  },
  ducky: (author) => {
    let responses = ["Cute.  No.", "Nice try.", "No way.", "Nope."];
    return author.sendMessage(responses[Math.floor(Math.random() * responses.length)]);
  }
};

module.exports.control = control;

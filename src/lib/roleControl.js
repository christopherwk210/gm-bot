const run = function (msg) {
  //Clean punctuation and symbols from messages
  //let mes = msg.content.replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g,"").toUpperCase();
  //Is this needed?
  /**
   *    Single word ping commands
   */
  let prefix = "!";
  if (msg.content.startsWith(prefix)) {
    //clean and sort data
    let args = msg.content.split(" ");
    let command = args[0].replace(prefix, "");
    args = args.slice(1);

    if (!args.length) {
      msg.author.sendMessage("You forgot to include a role...");
    } else {
      switch (command.toUpperCase()) {
        case "ROLE":
          toggleRole(msg, args);
          break;
      }
    }

    msg.delete();
  }
};

/**
 *    TOGGLE ROLE
 */
function toggleRole(msg, roleName) {
  let role = getRole(msg.guild.roles, roleName);

  switch (role) {
    case "ducky":
      ducky(msg.author);
      break;
    case "noone":
      msg.author.sendMessage("That is not a valid role");
      break;
    default:
      if (msg.member.roles.has(role.id)) {
        msg.member.removeRole(role);
        msg.author.sendMessage("Role " + role.name + " was removed.");
      }else {
        msg.member.addRole(role);
        msg.author.sendMessage("Role " + role.name + " has been granted.");
      }
      break;
  }
}

/**
 *    GET ROLE
 */
function getRole(roles, roleName) {
  //console.log(roles);
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
}

/**
 *    RUBBER DUCKY FAILURE
 */
function ducky(author) {
    let responses = ["Cute.  No.", "Nice try.", "No way.", "Nope."];
    return author.sendMessage(responses[Math.floor(Math.random() * responses.length)]);
}

module.exports.run = run;

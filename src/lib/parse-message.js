// Node libs
const fs = require("fs");

// Project libs
const pm = require('./pm');
const ids = require('../assets/json/ids.json');
const roleControl = require('./roleControl.js');
const docs = require('./docs.js');
const handleResources = require('./resources');
const birthday = require('./birthday');
const giveAways = require('./giveAwayLib.js');
const assemble = require('./assemble');

// Project data
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');
const help = {
  all: fs.readFileSync('./src/assets/markdown/help.all.md', 'utf8'),
  ducks: fs.readFileSync('./src/assets/markdown/help.ducks.md', 'utf8'),
  admins: fs.readFileSync('./src/assets/markdown/help.admins.md', 'utf8')
};

const run = function (msg) {
    //Clean punctuation and symbols from messages
    //let mes = msg.content.replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g,"").toUpperCase();
    //Is this needed?
    /**
     *    Single word ping commands
     */
    let prefix = "!";
    let args = msg.content.split(" ");
    let command = args[0].replace(prefix, "");

    if (msg.content.startsWith(prefix)) {
      switch (command.toUpperCase()) {
        case "WELCOME":
          msg.author.sendEmbed({
        		color: 26659,
        		description: welcome,
        		timestamp: new Date(),
        		footer: {
        			text: 'This is an automated message'
        		}
        	}).catch(err => console.log(err));
          msg.delete();
          break;
        case "RESOURCES":
          handleResources.run(msg, args);
          msg.delete();
          break;
        case "BIRTHDAY":
          //birthday.run(msg, args);
          //msg.delete();
          break;
        case "HELP":
          let command = "all";

          if ((msg.member) && (msg.member.roles)) {
            if (msg.member.roles.find('name', 'admin') || msg.member.roles.find('name', 'admins')) {
              command = 'admins';
            } else if (msg.member.roles.find('name', 'rubber duckies')) {
              command = 'ducks';
            }
          }

          switch (command) {
            case 'admins':
              msg.author.sendMessage(help.admins)
              .catch(err => console.log(err));
            case 'ducks':
              msg.author.sendMessage(help.ducks)
              .catch(err => console.log(err));
            case "all":
              msg.author.sendMessage(help.all)
              .catch(err => console.log(err));
              break;
          }
          msg.delete();
          break;
        case "ROLE":
          roleControl.control.toggleRole(msg, args.slice(1));
          msg.delete();
          break;
        case "DOCS":
          docs.control.run(msg, args);
          msg.delete();
          break;
        case "GIVEAWAY":
          giveAways.message(msg, args);
          msg.delete();
          break;
        case "QUACKQUACKQUACK":
        case "ASSEMBLE":
          assemble.assemble(msg, args);
          msg.delete();
          break;
        // case "STREAMWATCHER":
        //   try {
        //     if (msg.member) {
        //       var role = msg.member.guild.roles.find("name", "pixelduck");
        //       msg.member.addRole(role);
        //     }
        //   } catch(e) {
        //     console.log('An error occurred trying to add the stream watcher role');
        //   }
        //   msg.delete();
        //   break;
        case "BGMHAMMER":
          msg.channel.sendMessage(':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:').catch(err => console.log(err));
          msg.delete();
          break;
      }
    }

};

module.exports.run = run;

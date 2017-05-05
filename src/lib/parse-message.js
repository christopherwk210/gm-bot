// Node libs
const fs = require("fs");

// Project libs
const pm = require('./pm');
const ids = require('../assets/json/ids.json');
const roleControl = require('./roleControl.js');
const docs = require('./docs.js');
const handleResources = require('./resources');
const giveAways = require('./giveAwayLib.js');
const assemble = require('./assemble');

// Project data
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');
const help = {
  all: fs.readFileSync('./src/assets/markdown/help.all.md', 'utf8')
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
        case "HELP":
          let command = "all";

          switch (command) {
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
        case "ASSEMBLE":
          assemble.assemble(msg, args);
          msg.delete();
          break;
        case "BGMHAMMER":
          msg.channel.sendMessage(':regional_indicator_b: :regional_indicator_g: :regional_indicator_m: :hammer:').catch(err => console.log(err));
          msg.delete();
          break;
      }
    }

};

module.exports.run = run;

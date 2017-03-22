// Node libs
const fs = require("fs");

// Project libs
const pm = require('./pm');
const ids = require('../assets/json/ids.json');
const roleControl = require('./roleControl.js');
const docs = require('./docs.js');
const handleResources = require('./resources');

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
          break;
        case "RESOURCES":
          handleResources.run(msg, args);
          break;
        case "HELP":
          let command = "all";

          switch (command) {
            case "all":
              msg.author.sendMessage(help.all)
              .then(() => msg.author.sendFile('./src/assets/images/help.all.png'), err => console.log(err))
              .catch(err => console.log(err));
              break;
          }
          break;
        case "ROLE":
          roleControl.control.toggleRole(msg, args.slice(1));
          break;
        case "DOCS":
          docs.control.run(msg, args);
          break;
      }

      msg.delete();
    }

};

module.exports.run = run;

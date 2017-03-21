// Node libs
const fs = require("fs");

// Project libs
const pm = require('./pm');
const ids = require('../assets/json/ids.json');
const roleControl = require('./roleControl.js');
const help = require('./help.js');

// Project data
const welcome = fs.readFileSync('./src/assets/markdown/welcome.md', 'utf8');
const resources = fs.readFileSync('./src/assets/markdown/resources.md', 'utf8');

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
          msg.author.sendMessage(resources);
          break;
        case "HELP":
            let command = "all";

            switch (command) {
                case "all":
                  let description =
`
\`\`\`\n
!help      - outputs this message \n\n
!role      - toggles a role on and off \n
         usage: !role [role] \n
         available roles: 'voip' \n\n
!resources - outputs a list of trusted resources to assist with your GameMaker Studio journey\n\n
!docs      - outputs the URL to the documentation of a GML function \n
         usage: !docs [function_name] [optional: version] \n
         available versions: 'gms1','gms2'; defaults to 'gms2' \n
         example: !docs draw_sprite\n
         example: !docs draw_sprite gms2\n
         example: !docs draw_sprite gms1\n\n
\`\`\`\n\n
I can also assist you with your code formatting and auto generate GMLive snippets for you.\n\n\n
`;
                  msg.author.sendEmbed({
                    color: 26659,
                    // title: 'Hi, I\'m GameMakerBot. Here are my available commands:',
                    // description: description,
                    image: {url: 'http://i.imgur.com/N95fl5E.png'},
                    timestamp: new Date(),
                    footer: {
                      text: 'This is an automated message'
                    }
                  }).catch(err => console.log(err));
                    // msg.author.sendMessage(
                    //   "Hi, I'm GameMakerBot. Here are my available commands: \n" +
                    //   "```" +
                    //   "!help      - outputs this message \n\n" +
                    //   "!role      - toggles a role on and off \n" +
                    //   "             usage: !role [role] \n" +
                    //   "             available roles: 'voip' \n\n" +
                    //   "!resources - outputs a list of trusted resources to assist with your GameMaker Studio journey\n\n" +
                    //   "!docs      - outputs the URL to the documentation of a GML function \n" +
                    //   "             usage: !docs [function_name] [optional: version] \n" +
                    //   "             available versions: 'gms1','gms2'; defaults to 'gms2' \n" +
                    //   "             example: !docs draw_sprite\n" +
                    //   "             example: !docs draw_sprite gms2\n" +
                    //   "             example: !docs draw_sprite gms1\n\n" +
                    //   "```\n\n" +
                    //   "I can also assist you with your code formatting and auto generate GMLive snippets for you.\n\n\n"
                    // )
                    // .then(() => msg.author.sendMessage("**This is how you add code blocks to your messages in Discord:**"), err => console.log(err))
                    // .then(() => msg.author.sendFile('./gmbot-code-1.png'), err => console.log(err))
                    // .then(() => msg.author.sendMessage("**To have your code automatically formatted and enable syntax highlighting use the `clean-code` syntax:**"), err => console.log(err))
                    // .then(() => msg.author.sendFile('./gmbot-code-2.png'), err => console.log(err))
                    // .then(() => msg.author.sendMessage("**To generate a GMLive snippet in your message use the `gmlive` syntax:**"), err => console.log(err))
                    // .then(() => msg.author.sendFile('./gmbot-code-3.png'), err => console.log(err));
                    break;
            }

            break;
        case "ROLE":
          roleControl.control.toggleRole(msg, args.slice(1));
          break;
        case "DOCS":
          help.control.run(msg, args);
          break;
      }

      msg.delete();
    }

};

module.exports.run = run;

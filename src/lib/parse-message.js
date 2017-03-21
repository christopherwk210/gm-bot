// Node libs
const http = require('http');
const fs = require("fs");
const path = require('path');
const vm = require('vm');
const concat = require('concat-stream');

// Project libs
const pm = require('./pm');
const ids = require('../assets/json/ids.json');
const validate = require('./validate.js');
const roleControl = require('./roleControl.js');

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
          msg.author.sendMessage(welcome);
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
          let version = "gms2";

          if (args.length > 2) {
            version = args[2];
          } else if (args.length == 1) {
            msg.author.sendMessage("You did not include a function name. Type `!help` for help with commands.");
            break;
          }

          switch (version) {
            case "gms1":
              if (validate.gml.gms1(args[1])) {
                  helpUrlGMS1(msg, args[1]);
              } else {
                  msg.author.sendMessage("`" + args[1] + "` was not a recognized GMS1 function. Type `!help` for help with commands.");
              }
              break;
            case "gms2":
              if (validate.gml.gms2(args[1])) {
                  helpUrlGMS2(msg, args[1]);
              } else {
                  msg.author.sendMessage("`" + args[1] + "` was not a recognized GMS2 function. Type `!help` for help with commands.");
              }
              break;
            default:
              msg.author.sendMessage("`" + version + "` was not a valid option. Type `!help` for help with commands.");
              break;
          }
          break;
      }

      msg.delete();
    }

};

function helpUrlGMS2(msg, fn) {
    http.get("http://docs2.yoyogames.com/files/searchdat.js", (res) => {
        res.setEncoding('utf8');
        res.pipe(concat({encoding: 'string'}, function (remoteSrc) {
            let found = false;
            vm.runInThisContext(remoteSrc, 'remote_modules/searchdat.js');
            for (var i = 0; i < SearchTitles.length; i++) {
                if (SearchTitles[i] == fn) {
                    msg.channel.sendMessage('Here\'s the GMS2 documentation for ' + fn);
                    msg.channel.sendMessage(encodeURI('http://docs2.yoyogames.com/' + SearchFiles[i]));
                    found = true;
                }
            }

            if(!found){
                msg.author.sendMessage("`" + fn + "` was not a recognized GMS2 function. Type `!help` for help with commands.");
            }
        }));
    });
}

function helpUrlGMS1(msg, fn) {
    http.get("http://docs.yoyogames.com/files/searchdat.js", (res) => {
        res.setEncoding('utf8');
        res.pipe(concat({encoding: 'string'}, function (remoteSrc) {
            let found = false;
            vm.runInThisContext(remoteSrc, 'remote_modules/searchdat.js');
            for (var i = 0; i < SearchTitles.length; i++) {
                if (SearchTitles[i] == fn) {
                    msg.channel.sendMessage('Here\'s the GMS1 documentation for ' + fn);
                    msg.channel.sendMessage(encodeURI('http://docs.yoyogames.com/' + SearchFiles[i]));
                    found = true;
                }
            }
        }));
    });
}

module.exports.run = run;

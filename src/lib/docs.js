const validate = require('./validate.js');
const vm = require('vm');
const http = require('http');
const concat = require('concat-stream');
const gms1 = require('./searchdat-gms1');

const control = {
    run: function (msg, args) {
        let version = "gms2";

        if (args.length > 2) {
          version = args[2];
        } else if (args.length == 1) {
          msg.author.sendMessage("You did not include a function name. Type `!help` for help with commands.");
          return;
        }

        version = version.toUpperCase();

        switch (version) {
          case "GMS1":
            if (validate.gml.gms1(args[1])) {
                this.helpUrlGMS1(msg, args[1]);
            } else {
                msg.author.sendMessage("`" + args[1] + "` was not a recognized GMS1 function. Type `!help` for help with commands.");
            }
            break;
        case "GMS2":
            if (validate.gml.gms2(args[1])) {
                this.helpUrlGMS2(msg, args[1]);
            } else {
                msg.author.sendMessage("`" + args[1] + "` was not a recognized GMS2 function. Type `!help` for help with commands.");
            }
            break;
        default:
            msg.author.sendMessage("`" + version + "` was not a valid option. Type `!help` for help with commands.");
            break;
        }
    },
    helpUrlGMS2: (msg, fn) => {
      http.get("http://docs2.yoyogames.com/files/searchdat.js", (res) => {
        res.setEncoding('utf8');
        res.pipe(concat({encoding: 'string'}, function (remoteSrc) {
          let found = false;
          vm.runInThisContext(remoteSrc, 'remote_modules/searchdat.js');
          for (var i = 0; i < SearchTitles.length; i++) {
            if (SearchTitles[i] == fn) {
              msg.channel.sendMessage('Here\'s the GMS2 documentation for ' + fn).catch(err => console.log(err));
              msg.channel.sendMessage(encodeURI('http://docs2.yoyogames.com/' + SearchFiles[i]));
              found = true;
              break;
            }
          }

          if (!found) {
            msg.author.sendMessage("`" + fn + "` was not a recognized GMS2 function. Type `!help` for help with commands.");
          }
        }));
      });
    },
    helpUrlGMS1: (msg, fn) => {
      let found = false;

      for (var i = 0; i < gms1.titles.length; i++) {
        if (gms1.titles[i] == fn) {
          msg.channel.sendMessage('Here\'s the GMS1 documentation for ' + fn).catch(err => console.log(err));
          msg.channel.sendMessage(encodeURI('http://docs.yoyogames.com/' + gms1.files[i])).catch(err => console.log(err));
          found = true;
          break;
        }
      }
      if (!found) {
        msg.author.sendMessage("`" + fn + "` was not a recognized GMS2 function. Type `!help` for help with commands.");
      }
  }
};

module.exports.control = control;

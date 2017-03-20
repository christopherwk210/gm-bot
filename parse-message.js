const http = require('http');
const vm = require('vm');
const concat = require('concat-stream');
const pm = require('./pm');
const ids = require('./ids.json');
const validate = require('./validate.js');

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
            case "RESOURCES":
                msg.author.sendMessage(
                    "Here's your requested resources list: \n" +
                    "```" +
                    "www.resource1.com - A description to it\n" +
                    "www.resource1.com - A description to it\n" +
                    "```");
                break;
            case "HELP":
                let command = "all";

                switch (command) {
                    case "all":
                        msg.author.sendMessage(
                            "Hi, I'm GameMakerBot. Here are my available commands: \n" +
                            "```" +
                            "!help      - outputs this message \n\n" +
                            "!role      - toggles a role on and off \n" +
                            "             usage: !role [role] \n" +
                            "             available roles: 'voip' \n\n" +
                            "!resources - outputs a list of trusted resources to assist with your GameMaker Studio journey\n\n" +
                            "!docs      - outputs the URL to the documentation of a GML function \n" +
                            "             usage: !docs [function_name] [optional: version] \n" +
                            "             available versions: 'gms1','gms2'; defaults to 'gms2' \n" +
                            "             example: !docs draw_sprite\n" +
                            "             example: !docs draw_sprite gms2\n" +
                            "             example: !docs draw_sprite gms1\n\n" +
                            "```\n\n" +
                            "I can also assist you with your code formatting and auto generate GMLive snippets for you.\n\n\n"
                        )
                            .then(() => msg.author.sendMessage("**!!This is how you add code blocks to your messages in Discord:**", {file: "http://www.kyleaskew.com/gmbot-code-2.png"}))
                            .then(() => msg.author.sendMessage("**To have your code automatically formatted and enable syntax highlighting use the `clean-code` syntax:**", {file: "http://www.kyleaskew.com/gmbot-code-2.png"}))
                            .then(() => msg.author.sendMessage("**To generate a GMLive snippet in your message use the `gmlive` syntax:**", {file: "http://www.kyleaskew.com/gmbot-code-3.png"}));

                        break;
                }

                break;
            case "ROLE":
                toggleRole(msg, args.slice(1));
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

/**
 *    TOGGLE ROLE
 */
function toggleRole(msg, roleName) {
    if (!roleName.length) {
        msg.author.sendMessage("You forgot to include a role to toggle. Type `!help` for help with commands.");
        return;
    }

    let role = getRole(msg.guild.roles, roleName);

    switch (role) {
        case "ducky":
            ducky(msg.author);
            break;
        case "noone":
            msg.author.sendMessage("That is not a valid role. Type `!help` for help with commands.");
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
}

/**
 *    GET ROLE
 */
function getRole(roles, roleName) {
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
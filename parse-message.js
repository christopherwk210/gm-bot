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
            case "ROLE":
                toggleRole(msg, args.slice(1));
                break;
            case "HELP":
                let version = "gms2";
                let input = args.length;

                if (args.length > 2) {
                    version = args[2];
                } else if (args.length == 1) {
                    msg.author.sendMessage("You did not include a function name");
                    break;
                }

                switch (version) {
                    case "gms1":
                        if (validate.gml.gms1(args[1])) {
                            helpUrlGMS1(msg, args[1]);
                        } else {
                            msg.author.sendMessage(args[1] + " was not a recognized GMS1 function");
                        }
                        break;
                    case "gms2":
                        if (validate.gml.gms2(args[1])) {
                            helpUrlGMS2(msg, args[1]);
                        } else {
                            msg.author.sendMessage(args[1] + " was not a recognized GMS2 function");
                        }
                        break;
                    default:
                        msg.author.sendMessage(vet + " was not a valid option");
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
                    msg.channel.sendMessage('http://docs2.yoyogames.com/' + SearchFiles[i]);
                    found = true;
                }
            }
            if (!found) {
                pm.pm(ids.net8floz, msg, "The function " + fn + " was not found in gms2");
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
            if (!found) {
                pm.pm(ids.net8floz, msg, "The function " + fn + " was not found in gms1");
            }
        }));
    });
}

/**
 *    TOGGLE ROLE
 */
function toggleRole(msg, roleName) {
    if (!roleName.length) {
        msg.author.sendMessage("You forgot to include a role to toggle.");
        return;
    }

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
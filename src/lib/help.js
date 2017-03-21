// const run = function (msg) {
//     //Clean punctuation and symbols from messages
//     //let mes = msg.content.replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g,"").toUpperCase();
//     //Is this needed?
//     /**
//      *    Single word ping commands
//      */
//     let prefix = "!";
//     if (msg.content.startsWith(prefix)) {
//         //clean and sort data
//         let args = msg.content.split(" ");
//         let command = args[0].replace(prefix, "");
//         args = args.slice(1);
//
//
//         switch (command.toUpperCase()) {
//             case "HELP":
//                 msg.channel.sendMessage("Is help");
//                 break;
//         }
//
//
//         msg.delete();
//     }
//
// };
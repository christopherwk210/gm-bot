const Discord = require('discord.js');

/**
 * Sends a palette link along with an image of the pallete
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
*/
module.exports = function(msg, args) {
    // Remove the command "!palette" from the args array
    args.shift(-1);
    // Find name of palette, spaces changed to dashes, for link purposes. Lowercased.
    let paletteName = args.reduce((acc, val) => acc + '-' + val).toLowerCase();

    msg.channel.send('<https://lospec.com/palette-list/' + paletteName + '>')
    msg.channel.send({
        new Discord.Attachment('https://lospec.com/palette-list/' + paletteName + '-32x.png').catch(() => {});
    }).catch(() => {});
    msg.delete().catch(() => {});
}

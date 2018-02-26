const Discord = require('discord.js');
const https = require('https');

/**
 * Sends a palette link along with an image of the pallete
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
*/
module.exports = function(msg, args) {
    // Remove the command "!palette" from the args array
    args.shift(-1);

    if (args.length < 1) {
        let rnd = '';
        if (Math.random() < 1/16) rnd = ', ya dingus';
        msg.delete().catch(() => {});
        msg.channel.send('Invalid command usage'+rnd+'! Proper usage: ``!palette [palette_name]``');
        return;
    }

    // Find name of palette, spaces changed to dashes, for link purposes. Lowercased.
    let paletteName = args.reduce((acc, val) => acc + '-' + val).toLowerCase();

    // Create the embed
    let embed = new Discord.RichEmbed()
        .setTitle('Palette Not Found')
        .setURL('https://lospec.com/palette-list/' + paletteName)
        .setImage('https://lospec.com/palette-list/' + paletteName + '-32x.png')

    // Get the wepage to check if the palette exists
    https.get('https://lospec.com/palette-list/' + paletteName, (res) => {
        res.on('data', function (chunk) {

            // Turn the data into a string
            let str = chunk.toString();
            // Create a regex to find the <title>
            var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
            let out = str.match(re);

            if (out) {
                // slice off the <title> tags, to just get the title
                // WARNING: I am using magic numbers here because no one
                // puts anything into the title tag, but it might be smart
                // to re-do this bit to something less hacky
                let title = out[0].slice(7, -8);

                // update title of embed, send embed, delete command message
                embed.setTitle(title)
                msg.channel.send({embed});
                msg.delete().catch(() => {});

                return;
            }
        });
    }).on("error", (err) => {
        // Oh god. Oh man. This should not happen.
        console.log("Error getting lospec page (palette.js): " + err.message);
        // Send the embed anyway. It should say "Palette Not Found"
        msg.channel.send({embed});
        msg.delete().catch(() => {});

        return;
    });
}
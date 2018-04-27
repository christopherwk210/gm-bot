/* eslint-disable no-loop-func */

// Node libs
const Discord = require('discord.js');
const https = require('https');
const fs = require('fs');

// Cache path
const jsonPath = './src/assets/json/gmgithub.json';
// Name of user or organization requesting github content
const userAgent = 'GamemakerDiscord';

/**
 * Searches cached titles for GameMakerDiscord repositories
 * @param {Message} message Discord message
 * @param {Array<String>} args Command arguments
 */
module.exports = function(message, args) {
  // Remove "!github" command
  args.shift();
  // Check for refresh command or invalid command usage
  if (!args.length || args[0].toLowerCase() === 'refresh') {
    message.channel.send(args.length
                      ? 'Refreshed github command'
                      : 'The /r/Gamemaker Discord **community github** is available at https://github.com/GameMakerDiscord.\nYou can request a specific repository with: ``!github repository_name``');
    return refresh();
  }

  // Create search regex from input
  let regex = new RegExp(`^${args.join('-').replace(/[-_ ]/g, '[-_ ]?')}$`, 'i');

  // Read cache
  fs.readFile(jsonPath, (readErr, json) => {
    // Check for error, and act accordingly
    if (readErr) {
      console.log(readErr);
      message.channel.send('An error occured while attempting to read cached names. ' +
                           'Please try again or contact a bot developer if the issue persists');
      return refresh();
    }

    // Parse the json string, and create match flag
    json = JSON.parse(json);
    let foundMatch = false;

    // refresh if more than one hour has passed since last refresh
    if (((new Date().getTime() - Date.parse(json.lastRefresh)) / 60000) > 60) refresh();

    // Loop through cached names, and attempt to match regex
    for (name of json.names) {
      if (name.match(regex)) {
        foundMatch = true;

        // Create options for GET request
        let options = {
          hostname: 'api.github.com',
          path: `/repos/GameMakerDiscord/${name}`,
          method: 'GET',
          // Github rejects GET requests without a User-Agent header
          headers: { 'User-Agent': userAgent }
        }

        // Create request with aforementioned options
        let str = '';
        let req = https.request(options, res => {
          // Concatinate all incoming data
          res.on('data', data => { str += data.toString() });

          res.on('end', () => {
            // Parse concatinated data
            json = JSON.parse(str);

            // Create an embed containing the returned information
            let embed = new Discord.RichEmbed({
              title: name,
              url: json.html_url,
              description: json.description,
              timestamp: new Date(),
              footer: { text: `License: ${json.license.name}` }
            }).setThumbnail(json.owner.avatar_url);

            // Send the embed 🎉
            message.channel.send(embed);
          });
        });

        // Handle errors and finish sending request
        req.on('error', reqErr => console.log(reqErr));
        req.end();

        break;
      }
    }
    // Handle non-matched attempts
    if (!foundMatch) message.channel.send(`Could not find any repository with the name "${args.join(' ')}"`);
  });
};

/**
 * Caches repository names
 * @param {Channel} channel Discord channel
 */
async function refresh() {
  // Create options for GET request
  let options = {
    hostname: 'api.github.com',
    path: '/orgs/GameMakerDiscord/repos',
    method: 'GET',
    headers: { 'User-Agent': userAgent }
  }

  // Create start of json string, store minimum size
  let json = `{"lastRefresh":"${new Date()}","names":[`; // }}
  let emptyLen = json.length + 2;

  // Send https request with options
  let str = '';
  let req = https.request(options, res => {
    // Concatinate all data
    res.on('data', data => { str += data.toString(); });

    res.on('end', () => {
      // Parse concatinated data
      let data = JSON.parse(str);

      // Handle empty data
      if (!data.length) {
        console.log('ERROR: no data retrieved from refresh request in gmgithub.js');
        return;
      }

      // Add repo names to json string
      for (repo of data) json += `"${repo.name}",`;

      // Remove last comma, close array and object
      json = `${json.slice(0, -1)}]}`;

      // If json is not empty, write cache
      if (json.length > emptyLen) {
        fs.writeFile(jsonPath, json, () => console.log('Sucessfully refreshed gmgithub.json'));
      } else console.log('Failed to write gmgithub.json');
    });
  });

  // Handle error and finish sending request
  req.on('error', err => console.log(err));
  await req.end();
}

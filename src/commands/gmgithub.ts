/* eslint-disable no-loop-func */

import { Message } from 'discord.js';

declare let sendRefreshMessage;

// Node libs
import Discord = require('discord.js');
import https = require('https');
const fs = require('fs');

// Cache path
const jsonPath = './src/assets/json/gmgithub.json';
// Name of user or organization requesting github content
const userAgent = 'GameMakerDiscord';

/**
 * Searches cached titles for GameMakerDiscord repositories
 * @param message Discord message
 * @param args Command arguments
 */
module.exports = function(message: Message, args: string[]) {
  // Remove "!github" command
  args.shift();
  // Check for refresh command or invalid command usage
  if (!args.length || args[0].toLowerCase() === 'refresh') {
    // Invalid command usage
    if (!args.length) {
      message.channel.send(
        'The /r/Gamemaker Discord **community github** is available at ' +
        'https://github.com/GameMakerDiscord.\nYou can request a specific ' +
        'repository with: ``!github repository_name``'
      );
    }

    let sendRefreshMessage: any = !!args.length;

    // Refresh regardless of intention
    refresh((err) => {
      if (err) {
        // Output user-friendly error messages
        message.channel.send(err);
        return;
      }

      // Intentional refresh
      if (sendRefreshMessage) message.channel.send('Refreshed github command');
    });

    return;
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
      // Refresh the cache to hopefully fix whatever's wrong with it
      refresh((err) => { if (err) console.log(err); });
      return;
    }

    // Parse the json string and create match flag
    try {
      json = JSON.parse(json);

    // Refresh the file if it's borken, and prompt user to try again
    } catch (jsonErr) {
      console.log(jsonErr);
      return refresh((err) => {
        if (err) {
          // Output user-friendly error messages
          console.log(err);
          return;
        }

        // Intentional refresh
        if (sendRefreshMessage) {
          message.channel.send('There was an error reading cached github data. Please try again.');
        }
      });
    }

    let foundMatch = false;

    // refresh if more than one hour has passed since last refresh
    if (((new Date().getTime() - Date.parse(json.lastRefresh)) / 60000) > 60) refresh();

    // Loop through cached names, and attempt to match regex
    for (let name of json.names) {
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
        request(options, (err, str) => {
        
          // Parse concatinated data
          try {
            json = JSON.parse(str);
          } catch (jsonErr) {
            console.log(jsonErr);
            return message.channel.send('There was an error requesting github data. Please try again');
          }

          // Create an embed containing the returned information
          let embed = new Discord.RichEmbed({
            title: json.name,
            url: json.html_url,
            description: json.description,
            timestamp: new Date()
          });
          if (json.owner) embed.setThumbnail(json.owner.avatar_url);
          if (json.license) embed.setFooter(`License: ${json.license.name}`);

          // Send the embed 🎉
          message.channel.send(embed);
        });

        break;
      }
    }
    // Handle non-matched attempts
    if (!foundMatch) {
      message.channel.send(`Could not find any repository with the name "${args.join(' ')}"`);
      }
  });
};

/**
 * Caches repository names
 * @param channel Discord channel
 */
async function refresh(callBack?) {

  // Create options for GET request
  let options = {
    hostname: 'api.github.com',
    path: '/orgs/GameMakerDiscord',
    method: 'GET',
    headers: { 'User-Agent': userAgent }
  }

  // Get repository amount, then get repository names
  await request(options, (orgErr, orgStr) => {
    // Check for error
    if (orgErr) {
      console.log(orgErr);
      return;
    }

    // Find repository amount
    let repoCount = orgStr.match(/"public_repos":\s*([0-9]+)/)[1];

    // Change url, but use same options
    options.path = `/orgs/GameMakerDiscord/repos?per_page=${repoCount}`;

    // Create start of json string, store minimum size
    let json = `{"lastRefresh":"${new Date()}","names":[`; // }}
    let emptyLen = json.length + 2;

    // Get all repositories in organization
    request(options, (err, str) => {
      // Check for error
      if (err) {
        console.log(err);
        return;
      }

      let data;

      // Parse concatinated data
      try {
        data = JSON.parse(str);
      } catch (jsonErr) {
        console.log(jsonErr);

        //TODO: message not defined in this context
        // return message.channel.send(
        //   'There was an error requesting github data. Please try again');
      }

      // Handle empty data
      if (!data.length) {
        return callBack('ERROR: no data retrieved from refresh request in gmgithub.js');
      }

      // Add repo names to json string
      for (let repo of data) json += `"${repo.name}",`;

      // Remove last comma, close array and object
      json = `${json.slice(0, -1)}]}`;

      // If json is not empty, write cache
      if (json.length > emptyLen) {
        fs.writeFile(jsonPath, json, () => console.log('Sucessfully refreshed gmgithub.json'));
        callBack();
      } else callBack('Failed to write gmgithub.json');
    });
  });
}

/**
 * https request adapted for this script's usage
 * @param options options for https request
 * @param callBack function to run upon error or success
 */
function request(options: https.RequestOptions, callBack: Function) {
  let str = '';
  let req = https.request(options, res => {
    // Concatinate all incoming data
    res.on('data', data => { str += data.toString() });

    res.on('end', () => callBack((!str && 'Error requesting GMDG data') || '', str));
  });

  // Handle error and finish sending request
  req.on('error', err => callBack(err));
  req.end();
}

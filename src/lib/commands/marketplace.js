/* eslint-disable no-empty */

// Discord
const Discord = require('discord.js');

// Node imports
const puppeteer = require('puppeteer');

// Marketplace query URL
const searchURL = 'https://marketplace.yoyogames.com/search/results?utf8=✓&query=';

/**
 * Formats a query string to be valid for marketplace searches
 */
function fixQuery(q) {
  // Convert whitespaces to plus symbols
  let fixedSpaced = q.replace(/[\s]/g, '+');

  // Remove invalid characters
  return fixedSpaced.replace(/([^a-zA-Z+])/g, '');
}

/**
 * Marketplace asset descriptor object
 * @typedef {Object} MarketplaceResult
 * @property {string} title Asset title
 * @property {string} url Asset page url
 * @property {string} thumbnail URL of asset icon
 * @property {string} type Asset type
 * @property {string} price Asset price tag
 */

/**
 * Create a Discord rich embed for a given marketplace search result
 * @param {MarketplaceResult} result 
 */
function createResultEmbed(result) {
  return new Discord.RichEmbed({
    title: result.title,
    url: result.url,
    description: result.type + '\n' + result.price,
    color: 26659,
    timestamp: new Date()
  })
  .setThumbnail(result.image);
}

/**
 * Searches the marketplace for assets
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
*/
module.exports = async function(msg) {
  // let useEmbed = !!~msg.indexOf('-1');
  let query = msg.content.match(/("[\s\S]*")/g);

  // womp womp
  if (!query || query.length < 1) {
    msg.author.send('You must provide a search query: `!mp "query goes in here"`');
    return;
  }

  // Get start time to determine how long it takes to get results
  let startTime = new Date();

  // Create a loading message
  let loadingMessage;
  try {
    loadingMessage = await msg.channel.send(`Searching the marketplace for ${query}...`);
  } catch(e) {}

  // Remove quotation from the query
  query = query[0].replace(/"/g, '');

  // Fix search query
  let fixedQuery = fixQuery(query);

  // Construct valid search URL
  let validSearchURL = searchURL + fixedQuery;

  // Launch new chrome page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Search the marketplace
  await page.goto(validSearchURL);

  /**
   * Array of marketplace asset results
   * @type {MarketplaceResult[]}
   */
  const result = await page.evaluate(() => {
    let res = [];
    
    // Find all results on page
    let items = document.querySelectorAll('.feature-game');

    // Get the first three
    for (let i = 0; i < Math.min(items.length, 3); i++) {

      // Save the link and image path
      res.push({
        url: items[i].querySelector('a').href,
        image: items[i].querySelector('.feature-image').src,
        title: items[i].querySelector('.feature-link').innerHTML,
        type: items[i].querySelector('.feature-detail a').innerHTML,
        price: items[i].querySelector('.feature-price small').innerHTML
      });
    }

    return Promise.resolve(res);
  }, 7);

  // Delete the loading message
  if (loadingMessage) {
    try {
      await loadingMessage.delete();
    } catch(e) {}
  }

  // Finish time
  let endTime = new Date();

  if (result.length === 0) {
    msg.channel.send('No results found!\nYour search was: `' + query + '`');
  } else {
    let embed = createResultEmbed(result[0]);
    embed.setFooter(`Results generated in ${endTime - startTime}ms`);

    msg.channel.send(embed);
  }

  // Close the browser
  await browser.close();
}

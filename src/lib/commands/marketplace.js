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
 * Searches the marketplace for assets
 * @param {Message} msg Discord message
 * @param {Array<string>} args Command arguments
*/
module.exports = async function(msg) {
  // let useEmbed = !!~msg.indexOf('-1');
  let query = msg.content.match(/("[\s\S]*")/g);

  if (!query || query.length < 1) {
    msg.author.send('You must provide a search query: `!mp "query goes in here"`');
    return;
  }

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

  // Execute JS from within page
  const result = await page.evaluate(() => {
    let res = [];
    
    // Find all results on page
    let items = document.querySelectorAll('.feature-game');

    // Get the first three
    for (let i = 0; i < Math.min(items.length, 3); i++) {

      // Save the link and image path
      res.push({
        url: items[i].querySelector('a').href,
        image: items[i].querySelector('.feature-image').src
      });
    }

    return Promise.resolve(res);
  }, 7);

  if (result.length === 0) {
    msg.channel.send('No results found!\nYour search was: `' + query + '`');
  } else {
    msg.channel.send('Marketplace search results:\n\n' + result[0].url);
  }

  // Close the browser
  await browser.close();
}

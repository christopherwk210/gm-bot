import { Message, MessageEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass } from '../../shared';
import * as puppeteer from 'puppeteer';

@Command({
  matches: ['mp', 'marketplace'],
  ...prefixedCommandRuleTemplate
})
export class MarketplaceCommand implements CommandClass {
  /** Marketplace query URL */
  searchURL = 'https://marketplace.yoyogames.com/search/results?utf8=✓&query=';

  /**
   * Searches the marketplace for assets
   * @param msg 
   * @param args
   */
  async action(msg: Message, args: string[]) {
    // Shift away the command, then join the rest of the input into one string
    args.shift();

    let query;
    if (args.length === 0) {
      query = '';
    } else {
      query = args.reduce((acc, val) => `${acc} ${val}`);
    }

    // Remove double quotes surrounding query, if the user is into that kind of stuff
    if (query.match(/^"/) && query.match(/"$/)) query = query.slice(1, -1);

    // womp womp
    if (!query || query.length < 1) {
      msg.author.send('You must provide a search query: `!mp "query goes in here"` (The double quotes are optional)');
      return;
    }

    // Get start time to determine how long it takes to get results
    let startTime: any = new Date();

    // Create a loading message
    let loadingMessage;
    try {
      loadingMessage = await msg.channel.send(`Searching the marketplace for ${query}...`);
    } catch (e) {
      // If we can't send messages here, then we can't provide results... no point in continuing.
      return;
    }

    // Fix search query
    let fixedQuery = this.fixQuery(query);

    // Construct valid search URL
    let validSearchURL = this.searchURL + fixedQuery;

    // Launch new chrome page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Search the marketplace
    await page.goto(validSearchURL, {
      waitUntil: ['load', 'networkidle0']
    });

    /**
     * Array of marketplace asset results
     */
    const result: MarketplaceResult[] = await page.evaluate(() => {
      let res = [];

      // Find all results on page
      let items = document.querySelectorAll('.feature-game');

      // Get the first three
      for (let i = 0; i < Math.min(items.length, 3); i++) {

        // Save the link and image path
        res.push({
          url: items[i].querySelector('a').href,
          image: (<any>items[i].querySelector('.feature-image')).src,
          title: (<any>items[i].querySelector('.feature-link')).title,
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
      } catch (e) {}
    }

    // Finish time
    let endTime: any = new Date();

    if (result.length === 0) {
      msg.channel.send(`No results found!\nYour search was: \`${query}\``);
    } else {
      let embed = this.createResultEmbed(result[0]);
      embed.setFooter(`Results generated in ${endTime - startTime}ms`);

      msg.channel.send(embed);
    }

    // Close the browser
    await browser.close();
  }

  /**
   * Formats a query string to be valid for marketplace searches
   */
  fixQuery(q: string) {
    // Convert whitespaces to plus symbols
    let fixedSpaced = q.replace(/[\s]/g, '+');

    // Remove invalid characters
    return fixedSpaced.replace(/([^a-zA-Z+])/g, '');
  }

  /**
   * Create a Discord rich embed for a given marketplace search result
   * @param result
   */
  createResultEmbed(result: MarketplaceResult) {
    return new MessageEmbed({
      title: result.title,
      url: result.url,
      description: `${result.type.replace(/s$/i, '')}\n${result.price}`,
      color: defaultEmbedColor,
      timestamp: new Date()
    }).setThumbnail(result.image);
  }
}

interface MarketplaceResult {
  /** Asset title */
  title: string;

  /** Asset page url */
  url: string;

  /** URL of asset icon */
  thumbnail: string;

  /** Asset type */
  type: string;

  /** Asset price tag */
  price: string;

  image?: any;
}

import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';
import * as https from 'https';
import * as url from 'url';

@Command({
  matches: ['search', 'gmcw'],
  ...prefixedCommandRuleTemplate
})

export class GMCWSearch implements CommandClass {
  async action(msg: Message, args: string[]) {
    let loadingMessage: Message | Message[];
    let query: string;
    let limit: number;
    // Get search query
    args.shift();

    // first argument is optionally a search number
    if (parseInt(args[0], 10)) {
      limit = Math.min(6, parseInt(args[0], 10));
      args.shift();
    } else {
      limit = 1;
    }

    query = args.join(' ');

    // No query provided
    if (!query) {
      msg.channel.send(
        'The unity Community Wiki is available at ' +
        'https://gmcw.dev/\n\nYou can use GMCW\'s search ' +
        'with: ``!search search term``'
      );
      return;
    }

    // Perform search
    let searchResults = await this.doSearch(query, limit);

    if (!searchResults) {
      (<Message>loadingMessage).delete();
      msg.channel.send(`Could not get search results from GMCW for query "${query}", ` +
                       `try visiting the websit directly at <https://gmcw.dev/search/${encodeURI(query)}>`);
      return;
    }

    let resultQuery = searchResults[0];
    let resultTitles = searchResults[1];
    let resultText = searchResults[2];
    let resultLink = searchResults[3];
    let resultIndexes = searchResults[4];

    let count = resultTitles.length;

    if (count) {
      if (limit > 1) {
        msg.channel.send(`Here are the top results for query "${query}", visit GMCW at ` +
                         `<https://gmcw.dev/search/${encodeURI(query)}> for more results`);
      }

      const sitemap = {
        gmcw_docs: {
          icon_url: 'https://cdn.discordapp.com/icons/262834612932182025/a_4231752117da95cf3f76443e36611807.webp?size=20',
          text: 'unity Studio 2 Documentation',
          color: 0x000000
        },
        gmcw_wiki: {
          icon_url: 'https://gmcw.dev/favicon.png',
          text: 'unity Community Wiki',
          color: 0x039E5C
        },
        gmcw_yal: {
          icon_url: 'https://cdn.discordapp.com/avatars/183367789501874176/3d3a6113f1c3199a3937f98b6ec4aeb1.png?size=20',
          text: 'YellowAfterlife',
          color: 0x889EC5
        }
      };

      for (let i = 0; i < count; i++) {
        let embed = new RichEmbed({
          title: resultTitles[i],
          url: resultLink[i],
          description: resultText[i],
          color: sitemap[resultIndexes[i]].color,
          footer: {
            icon_url: sitemap[resultIndexes[i]].icon_url,
            text: sitemap[resultIndexes[i]].text
          }
        });
        msg.channel.send(embed);
      }
    } else {
      msg.channel.send(`No results, try a different search term or visit GMCW directly at ` +
                       `<https://gmcw.dev/search/${encodeURI(query)}>`);
    }
  }

  /**
   * Fetches search results from gmcw
   */
  async doSearch(query: string, limit: number): Promise<any> {
    let queryUrl = url.parse(url.format({
      protocol: 'https',
      hostname: 'gmcw.dev',
      pathname: '/api/suggest',
      query: {
        q: query,
        discord: true,
        max: limit,
        frag: 100,
        frag_num: 2,
        index: true
      }
    }));

    let chunks = [];
    return new Promise(resolve => {
      https.get({
        hostname: queryUrl.hostname,
        path: queryUrl.path
      }, res => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return resolve(false);
        }

        res.on('data', data => chunks.push(data));

        res.on('end', () => {
          resolve( JSON.parse(chunks.join('')) );
        });

        res.on('error', err => {
          resolve(false);
        });
      }).end();
    });
  }
}

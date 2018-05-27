import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';
import * as https from 'https';

@Command({
  matches: ['github', 'community-github', 'gh'],
  ...prefixedCommandRuleTemplate
})
export class GithubCommand implements CommandClass {
  /** API url */
  api = 'https://chrisanselmo.com/gmd_ghorg_api';

  async action(msg: Message, args: string[]) {
    let loadingMessage: Message | Message[], query: string;

    // Get search query
    args.shift();
    query = args.join(' ');

    // No query provided
    if (!query) {
      msg.channel.send(
        'The /r/Gamemaker Discord **community github** is available at ' +
        'https://github.com/GameMakerDiscord.\n\nYou can request a specific ' +
        'repository with: ``!github repository name``'
      );
      return;
    }

    // Loading message
    try {
      loadingMessage = await msg.channel.send(`Searching the community GitHub for ${query}...`);
    } catch(e) {
      // If we can't send messages here, then we can't provide results... no point in continuing.
      return;
    }

    // Fetch info from API
    let githubInfo = await this.fetchGithubInfo();

    // Uh oh, spaghettios
    if (!githubInfo) {
      (<Message>loadingMessage).delete();
      msg.channel.send('There was an error connecting to the API. Please try again later!');
      return;
    }

    // Perform search
    let repos: any[] = githubInfo.repos;
    let searchResult = repos.find(repo => !!~repo.name.toUpperCase().indexOf(query.toUpperCase()));

    if (!searchResult) {
      (<Message>loadingMessage).delete();
      msg.channel.send(`Could not find any repository with the query "${query}"`);
      return;
    }

    // Paint a pretty picture
    let embed = new RichEmbed({
      title: searchResult.name,
      url: searchResult.html_url,
      description: searchResult.description,
      timestamp: new Date()
    });
    if (searchResult.owner) embed.setThumbnail(searchResult.owner.avatar_url);

    // Set the footer
    let footer = '';
    if (searchResult.license) footer = `License: ${searchResult.license.spdx_id || searchResult.license.name}`;
    if (searchResult.license && searchResult.stargazers_count) footer += ' | ';
    if (searchResult.stargazers_count) footer += `Stars: ${searchResult.stargazers_count}`;
    embed.setFooter(footer);

    // Send the embed 🎉
    msg.channel.send(embed);
    (<Message>loadingMessage).delete();
  }

  /**
   * Fetches the latest GH information from the relay API
   */
  async fetchGithubInfo(): Promise<any> {
    let chunks = [];
    return new Promise(resolve => {
      https.get(this.api, res => {
        res.on('data', data => {
          chunks.push(data.toString());
        });

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

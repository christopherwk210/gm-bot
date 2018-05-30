import * as http from 'http';
import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass } from '../../shared';
import { load } from 'cheerio';

@Command({
  matches: ['miniboss', 'mb'],
  ...prefixedCommandRuleTemplate
})
export class MinibossCommand implements CommandClass {
  url = 'http://blog.studiominiboss.com/pixelart';

  help = 'You can use `!miniboss [image number]` or `!miniboss [image name]` ' +
         'command to get a specific post with image from the site.';

  link = 'Here\'s a list of useful pixelart references:\n' +
         '<http://blog.studiominiboss.com/pixelart>\n';

  /**
   * Command action
   * @param msg 
   * @param args
   */
  async action(msg: Message, args: string[]) {
    // User doesn't know what they are doing, send 'em the deets
    if (args.length <= 1) {
      msg.channel.send(`${this.help}\n\n${this.link}`);
      return;
    }

    let postInfo;

    // If a name is provided
    if (args.length > 2) {
      let imageName = args.splice(1).join(' ');
      postInfo = await this.getPostByImageName(imageName);
    } else {
      let imageNumber = parseInt(args[1]);
      postInfo = isNaN(imageNumber) ?
        await this.getPostByImageName(args[1]) :
        await this.getPostByNumber(imageNumber);
    }

    // Ensure valid information was returned
    if (!postInfo) return msg.channel.send(`Invalid usage!\n${this.help}`);

    // Handle no post
    if (!postInfo.length) return msg.channel.send('Post not found!');

    postInfo = postInfo[0];

    // Create embed
    msg.channel.send(new RichEmbed({
      title: postInfo.title,
      color: defaultEmbedColor,
      url: postInfo.image,
      image: {
        url: postInfo.image
      },
      footer: {
        icon_url: 'http://i.imgur.com/y4c0rPv.png',
        text: this.url
      }
    }));
  }

  /**
   * Gets a miniboss post by the post number
   * @param postNumber 
   */
  async getPostByNumber(postNumber: number) {
    let postData = await this.getMinibossPostData();
    if (!postData) return false;

    return postData.filter(post => !!~post.title.indexOf(postNumber.toString()));
  }

  /**
   * Gets a miniboss post by the name of the post
   * @param postName 
   */
  async getPostByImageName(postName: string) {
    let postData = await this.getMinibossPostData();
    if (!postData) return false;

    return postData.filter(post => !!~post.title.toUpperCase().indexOf(postName.toUpperCase()));
  }

  /** 
   * Fetches information from the Miniboss page and formats
   * the posts into a readable format
   */
  async getMinibossPostData() {
    const html = await this.getTutorialsPage();
    if (!html) return false;

    // Load the site into cheerio
    const $ = load(<string>html);

    // Load the body text and remove that one stupid post that messes everything up
    let bodyText = $('body')
      .text()
      .replace('Reading text with a timer is a bit stressful, so I added still frames of this tutorial:', '');
  
    // Get all gifs
    let gifs = $('img').filter((i, img) => !!~img.attribs['src'].indexOf('gif'));

    // Get all post titles
    let titles = bodyText.match(/#[0-9]+( | )([^#])+/g);
  
    // Retrieve the source links for each image
    let imageSourceList = gifs.toArray().map(img => img.attribs['src']);

    // Combine all the data
    let minibossData: MinibossPost[] = [];

    imageSourceList.forEach((source, index) => {
      minibossData.push({
        title: titles[index],
        image: source
      });
    });

    return minibossData;
  }

  /**
   * Returns the miniboss tutorial page as HTML
   */
  getTutorialsPage() {
    let chunks = [];
    return new Promise(resolve => {
      http.get(this.url, res => {
        res.setEncoding('utf8');
        res.on('data', data => chunks.push(data));
        res.on('end', () => resolve(chunks.join('')));
        res.on('error', err => resolve(false));
      }).end();
    });
  }
}

interface MinibossPost {
  /** Post title */
  title: string;

  /** Image URL */
  image: string;
}

import { Message, RichEmbed, User } from 'discord.js';
import { prefixedCommandRuleTemplate , defaultEmbedColor } from '../../config';
import {
    Command,
    CommandClass,
    detectStaff
  } from '../../shared';

@Command({
    matches: ['starter', 'starterpack', 'starterkit'],
    ...prefixedCommandRuleTemplate
})
export class StarterCommand implements CommandClass {
    action(msg: Message, args: string[]) {
        let whoMessage = msg.author;

        // #region Stuff for pinging and sending to pinged users
        // check for mentioned user
        if (msg.mentions.users.first() !== undefined  && detectStaff(msg.member)) {
            whoMessage = msg.mentions.users.first();
            // check if tagged user is a member of of the server
            if (msg.mentions.members.first() === undefined || msg.mentions.users.first().id !== msg.mentions.members.first().id) {
                msg.author.send(`<@${whoMessage.id}> was not a recognized user.`);
                return;
            }
        }
        // #endregion

        // if someone is actually needing the message
        if (whoMessage !== undefined ) {
            // load in those saucy recources
            const kitEmbed = new RichEmbed ({
                title: '__**r/GM Resource Pack**__',
                description: '**The following is a set of useful sources for learning GML and other GameMaker development skills.**',
                thumbnail: {  url: 'https://www.yoyogames.com/images/gms2_logo_512.png'  },
                fields: [
                  {
                    name: '**GML Written Articles:**',
                    value: '[GMS1.x Documentation](http://docs.yoyogames.com/) \
                    \n [GMS2 Documentation](http://docs2.yoyogames.com/) \
                    \n [Xor Shader Tutorials](https://xorshaders.weebly.com/) \
                    \n [Amazon GM Recources](http://m.amazonappservices.com/GameMakerResources)'
                  },

                  {
                    name: '**GML Video Tutorials and Channels:**',
                    value: '[Pixelated Pope](https://www.youtube.com/user/PixelatedPope) \
                    \n [Shaun Spalding](https://www.youtube.com/user/999Greyfox) \
                    \n [HeartBeast](https://www.youtube.com/user/uheartbeast) \
                    \n [Freindly Cosmonaut](https://www.youtube.com/channel/UCKCKHxkH8zqV9ltWZw0JFig) \
                    \n [Very useful bite sized videos on specific topics](https://www.youtube.com/channel/UCcYKLm0EwyWkfTA6sMn5W7g) \
                    \n [Official YYG Youtube](https://www.youtube.com/user/yoyogamesltd)'
                  },

                  {
                    name: '**Advanced GML Topics:**',
                    value: '[Git based source control with GMS2](https://www.youtube.com/watch?v=6zj86KN8Vco) \
                    \n [Debug Mode Basics](https://www.youtube.com/watch?v=iJH_uTq9iOQ) \
                    \n [GMS2 3D Crash Course](https://goo.gl/dqFvus)'
                  },

                  {
                    name: '**Basic Art Skill Articles:**',
                    value: '[Guide to Being A Respectful Critic](http://tiny.cc/critique) \
                    \n [Basic Guide to Pixelart](http://pixeljoint.com/forum/forum_posts.asp?TID=11299)'
                  },

                  {
                    name: '**Art Video Resources and Channels:**',
                    value: '[MortMort](https://www.youtube.com/user/atMNRArt) \
                    \n [Guide on Choosing the Right Canvas Size](https://www.youtube.com/watch?v=AXb-VBZTKDA)'
                  },

                  {
                    name: '**Pixelart Refrence Sites:**',
                    value: '[Miniboss](http://blog.studiominiboss.com/pixelart) \
                    \n [The Spriters Recource](https://www.spriters-resource.com/) \
                    \n [Find Palletes Here](https://lospec.com/palette-list)'
                  },
                  {
                    name: '**Music Theory and Learning Sites/Channels:**',
                    value: '[MusicTheory.net](https://www.musictheory.net/lessons) \
                    \n [12tone Building Blocks](https://www.youtube.com/playlist?list=PLMvVESrbjBWplAcg3pG0TesncGT7qvO06)'
                  },

                  {
                    name: '**Other Useful Topics and Resources:**',
                    value: '["Your First Game Will (and Should) Suck" By: PixelatedPope](https://goo.gl/sgz7d2) \
                    \n [Your Game Idea is Too Big](http://yourgameideaistoobig.com) \
                    \n [Rubber Duck Debugging](https://rubberduckdebugging.com/)'
                  }
                ],
                color: defaultEmbedColor
              });
            whoMessage.send(kitEmbed);
        }
    }
}

import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import {
  Command,
  CommandClass,
  detectStaff
} from '../../shared';

import { resources, ResourceList } from './resources';

@Command({
  matches: ['starter', 'starterpack', 'starterkit'],
  ...prefixedCommandRuleTemplate
})
export class StarterCommand implements CommandClass {
  action(msg: Message, args: string[]) {

    // Determine who we should mention
    let whoMessage = detectStaff(msg.member) ? msg.mentions.members.first() : msg.author;

    // Abort on missing person!
    if (!whoMessage) whoMessage = msg.author;

    // If someone is actually needing the message
    if (whoMessage) {

      // Load in those saucy recources
      const kitEmbed = new RichEmbed ({
        title: '__**r/GM Resource Pack**__',
        description: '**The following is a set of useful sources for learning GML and other GameMaker development skills.**',
        thumbnail: {  url: 'https://www.yoyogames.com/images/gms2_logo_512.png'  },
        fields: this.constructEmbedFields(resources),
        color: defaultEmbedColor
      });

      whoMessage.send(kitEmbed);
    }
  }

  /**
   * Constructs a valid Discord embed fields array from a serialized resource list
   * @param resourcesList 
   */
  constructEmbedFields(resourcesList: ResourceList) {
    let fields = [];

    Object.keys(resourcesList).forEach(category => {
      let name = `**${category}**`;
      let value = [];

      resourcesList[category].forEach(field => {
        value.push(`${field.label ? field.label + ' ' : ''}[${field.title}](${field.url})`);
      });

      fields.push({ name, value: value.join('\n') });
    });

    return fields;
  }
}

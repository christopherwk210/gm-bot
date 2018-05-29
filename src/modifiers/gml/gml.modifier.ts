import { Message } from 'discord.js';
import { Modifier, ModifierClass, executeGML, detectStaff } from '../../shared';

@Modifier({
  match: 'gml'
})
export class GmlModifier implements ModifierClass {

  async action(msg: Message, contents: string[]) {
    /**
     * Execute *only* the first code block found,
     * as executing multiple code blocks would be
     * too resource intensive.
     */
    executeGML(contents[0], (err, data) => {
      if (err) {
        console.log(err);
        msg.channel.send(err);
      } else {        
        let returnString = 'GML execution complete.\n\n**Trace Log:**\n```';

        data.trace.forEach(entry => {
          returnString += `${entry}\n`;
        });

        msg.channel.send( `${returnString.substring(0, returnString.length - 1)}\`\`\` \n Powered by GMLive.` );
      }
    });
  }

  /**
   * STAFF ONLY FOOLS
   * @param msg 
   */
  pre(msg: Message) {
    return !!detectStaff(msg.member);
  }
}

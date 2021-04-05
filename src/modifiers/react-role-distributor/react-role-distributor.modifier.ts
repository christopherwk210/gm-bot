import { Message, TextChannel } from 'discord.js';
import { Modifier, ModifierClass, jsonService, reactRoleDistributionService, RoleMessageConfig } from '../../shared';

@Modifier({
  match: 'role-msg-config',
  delete: true
})
export class ReactRoleDistributorModifier implements ModifierClass {
  /** Beautify rules as loaded from local JSON */
  beautifyOptions: JsBeautifyOptions = jsonService.files['jsbeautify'];

  action(msg: Message, contents: string[], match: string) {
    if (contents.length === 1) {
      let data: RoleMessageConfig;

      try {
        data = JSON.parse(contents[0]);
      } catch (e) {
        msg.author.send('Could not parse your JSON!');
        return;
      }

      if (!data.message || !data.roles) {
        msg.author.send('Invalid JSON!');
        return;
      }

      reactRoleDistributionService.newConfig(msg.author, msg.channel as TextChannel, data);
    }
  }

  pre(msg: Message) {
    return ['144913457429348352'].includes(msg.author.id);
  }
}

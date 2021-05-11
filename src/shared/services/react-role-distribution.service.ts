import * as path from 'path';
import * as fs from 'fs';
import { Message, Role, TextChannel, User } from 'discord.js';
import { channelService } from '../';

export interface RoleMessageConfig {
  message: string;
  roles: {
    emoji?: string;
    emojiName: string;
    description: string;
    roleID: string;
  }[];
}

interface RoleMessageTracker {
  messageID: string;
  config: RoleMessageConfig;
}

class ReactRoleDistributionService {
  configPath = path.join(__dirname, '../../../data/reacts/');
  currentMessages: RoleMessageTracker[] = [];

  init() {
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath);
    }

    this.loadConfigs();
  }

  newConfig(author: User, channel: TextChannel, config: RoleMessageConfig) {
    let message = config.message + '\n\n';
    for (const role of config.roles) {
      console.log(role.emojiName);
      const e = channel.guild.emojis.find(val => val.name === role.emojiName);
      if (e) {
        message += `${e} - ${role.description}\n`;
      } else {
        message += `:${role.emojiName}: - ${role.description}\n`;
      }
    }

    channel.send(message).then(async (msg: Message) => {
      for (const role of config.roles) {
        try {
          if (role.emoji) {
            await msg.react(role.emoji);
          } else {
            const em = msg.guild.emojis.find(e => e.name === role.emojiName);
            await msg.react(em);
          }
        } catch (e) {
          console.error(e);
          author.send('```' + JSON.stringify(role) + '```');
        }
      }

      this.currentMessages.push({ messageID: msg.id, config });

      const newPath = path.join(this.configPath, msg.id + '.json');
      const tracker: RoleMessageTracker = { messageID: msg.id, config };
      fs.writeFile(newPath, JSON.stringify(tracker), { encoding: 'utf8' }, err => {
        if (err) {
          author.send(
            'The message was created, but the config was not saved... I suggest deleting the message the bot made and trying again.'
          );
        }
      });
    }).catch(fail => {
      // Message couldn't be sent. If this doesn't happen, nothing else will
      // which will be obvious soooo... no op needed I guess idk
    });
  }

  loadConfigs() {
    fs.readdir(this.configPath, (err, files) => {
      if (!err) {
        for (const file of files) {
          if (path.extname(file).includes('json')) {
            try {
              const fileContents = fs.readFileSync(path.join(this.configPath, file), { encoding: 'utf8' });
              const parsed: RoleMessageTracker = JSON.parse(fileContents);
              if (parsed.messageID && parsed.config.message && parsed.config.roles) {
                this.currentMessages.push(parsed);
              }
            } catch (e) {
              console.log('Could not load config!', e);
            }
          }
        }
      } else {
        console.log('Could not read react configs!', err);
      }
    });
  }
}

export let reactRoleDistributionService = new ReactRoleDistributionService();

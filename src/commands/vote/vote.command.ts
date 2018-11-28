import { Message, RichEmbed, MessageCollector } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor, serverIDs } from '../../config';
import { Command, CommandClass, detectStaff, roleService } from '../../shared';
import { AssembleCommand } from '../assemble/assemble.command';

@Command({
  matches: ['vote'],
  ...prefixedCommandRuleTemplate
})
export class VoteCommand implements CommandClass {
  voteEmojiList = [
    '🇦',
    '🇧',
    '🇨',
    '🇩',
    '🇪',
    '🇫',
    '🇬',
    '🇭',
    '🇮',
    '🇯',
    '🇰'
  ];

  /**
   * Command action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  async action(msg: Message, args: string[]) {
    let currentVoteConfiguration: VoteConfig = {
      title: '',
      description: '',
      pingChoice: 'none',
      time: 60,
      voteOptions: ['']
    };

    let currentStep: VoteWizardStep = VoteWizardStep.TITLE;

    await msg.author.send('You\'ve initiated the vote creation wizard. Type "stop" any time to cancel.');
    await msg.author.send('What is the name of this vote?');

    const collector = new MessageCollector(msg.author.dmChannel, m => m.author.id === msg.author.id, {});

    collector.on('collect', async message => {
      if (message.content.toLowerCase() === 'stop') {
        collector.stop();
        await msg.author.send('~~Nuclear crises diverted~~ Vote wizard cancelled.');
        return;
      }

      switch (currentStep) {
        case VoteWizardStep.TITLE:
          currentVoteConfiguration.title = message.content;
          currentStep = VoteWizardStep.DESCRIPTION;
          msg.author.send('Title saved ✅\nWhat is the description of this vote?');
          break;

        case VoteWizardStep.DESCRIPTION:
          currentVoteConfiguration.description = message.content;
          currentStep = VoteWizardStep.PING_CHOICE;
          msg.author.send(
            'Description saved ✅\nShould this vote ping any users?\n\nPlease type either "staff", "ducks", "both", or "none"'
          );
          break;

        case VoteWizardStep.PING_CHOICE:
          let loweredContent = message.content.toLowerCase();

          switch (loweredContent) {
            case 'staff':
            case 'ducks':
            case 'both':
              currentVoteConfiguration.pingChoice = loweredContent;
              break;
          }
          currentStep = VoteWizardStep.VOTE_OPTIONS;
          msg.author.send(
            `Ping choice saved as ${currentVoteConfiguration.pingChoice} ✅\n` +
            `What should the options in this vote be? Please separate voting options by comma (max 11), i.e.\n\n` +
            `\`Yes, No, Maybe\``
          );
          break;

        case VoteWizardStep.VOTE_OPTIONS:
          currentVoteConfiguration.voteOptions = message.content.split(',').map(s => s.trim());
          currentStep = VoteWizardStep.TIME;
          msg.author.send(
            'Vote options saved ✅\nHow long should your vote last (in minutes)?\n\n1440 minutes == 24 hours'
          );
          break;

        case VoteWizardStep.TIME:
          currentVoteConfiguration.time = parseInt(message.content, 0);

          if (isNaN(currentVoteConfiguration.time) || currentVoteConfiguration.time <= 0) {
            currentVoteConfiguration.time = 60;
          }

          currentStep = VoteWizardStep.CONFIRM;
          await msg.author.send(
            `Time saved as ${currentVoteConfiguration.time}m ✅`
          );

          const embed = new RichEmbed({
            color: defaultEmbedColor,
            description: `${currentVoteConfiguration.description}\n\n${this.descriptionFromVotes(currentVoteConfiguration.voteOptions)}`,
            title: currentVoteConfiguration.title,
            footer: {
              text: `This vote will be concluded in ${currentVoteConfiguration.time}m`
            }
          });

          await msg.author.send('\n\nVote preview:');
          await msg.author.send(embed);
          await msg.author.send('Type "send" to send this vote to the channel you triggered the !vote command from, or "stop" to cancel.');
          break;

        case VoteWizardStep.CONFIRM:
          if (message.content.toLowerCase() === 'send') {
            collector.stop();
            await this.sendVoteToChannel(msg, currentVoteConfiguration);
            await msg.author.send('Vote sent 👍');
          } else {
            collector.stop();
            await msg.author.send('Vote discarded.');
          }
          break;
      }
    });
  }

  async sendVoteToChannel(msg: Message, voteConfig: VoteConfig) {
    const embed = new RichEmbed({
      color: defaultEmbedColor,
      description: `${voteConfig.description}\n\n${this.descriptionFromVotes(voteConfig.voteOptions)}`,
      title: voteConfig.title,
      footer: {
        text: `This vote will be concluded in ${voteConfig.time}m`
      }
    });

    const assembleCommand = new AssembleCommand();
    const serverStaffRole = roleService.getRoleByID(serverIDs.roles.serverStaff);

    switch (voteConfig.pingChoice) {
      case 'staff':
        await msg.channel.send(`${serverStaffRole}`);
        break;
      case 'ducks':
        await assembleCommand.action(msg, []);
        break;
      case 'both':
        await msg.channel.send(`${serverStaffRole}`);
        await assembleCommand.action(msg, []);
        break;
    }

    const voteMessage: Message = <Message> await msg.channel.send(embed);

    let voteEmojis = [];
    let i = 0;
    for (const opt of voteConfig.voteOptions) {
      await voteMessage.react(this.voteEmojiList[i]);
      voteEmojis.push(this.voteEmojiList[i]);
      ++i;
    }

    const filter = reaction => voteEmojis.includes(reaction.emoji.name);
    const collector = voteMessage.createReactionCollector(filter, { time: voteConfig.time * 1000 * 60 });

    collector.on('end', async collected => {
      const reactions = collected.array();
      let currentWinners = [];
      let currentWinnerCount = 0;

      reactions.forEach(reaction => {
        if (reaction.count > currentWinnerCount) {
          currentWinnerCount = reaction.count;
          currentWinners = [reaction.emoji.name];
        } else if (reaction.count === currentWinnerCount) {
          currentWinnerCount = reaction.count;
          currentWinners.push(reaction.emoji.name);
        }
      });

      await msg.channel.send(`The ${voteConfig.title} vote has concluded!`);

      if (currentWinners.length < 1) {
        await msg.channel.send('...no one voted lol');
      } else if (currentWinners.length === 1) {
        await msg.channel.send(`The winner of this vote is: ${voteConfig.voteOptions[this.voteEmojiList.indexOf(currentWinners[0])]}`);
      } else {
        let ties = [];
        currentWinners.forEach(winner => {
          const optIndex = this.voteEmojiList.indexOf(winner);
          ties.push(voteConfig.voteOptions[optIndex]);
        });
        await msg.channel.send(`The winner of this vote is tied between:\n\n${ties.join(', ')}`);
      }
    });
  }

  /**
   * Transform a list of vote options into an organized list with matching emojis
   */
  descriptionFromVotes(voteOptions: string[]) {
    let desc = '';

    voteOptions.forEach((vote, index) => {
      desc += `${this.voteEmojiList[index]} ${vote}\n\n`;
    });

    return desc;
  }

  /**
   * Admin use only!
   * @param msg 
   * @param args
   */
  pre(msg: Message, args: string[]) {
    return detectStaff(msg.member) === 'admin';
  }
}

interface VoteConfig {
  title: string;
  description: string;
  pingChoice: 'staff' | 'ducks' | 'both' | 'none';
  voteOptions: string[];
  time: number;
}

enum VoteWizardStep {
  TITLE,
  PING_CHOICE,
  DESCRIPTION,
  VOTE_OPTIONS,
  TIME,
  CONFIRM
}

import { Message, RichEmbed, MessageCollector, MessageReaction } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor, serverIDs } from '../../config';
import { Command, CommandClass, detectStaff, detectOutsideStaff, roleService, channelService } from '../../shared';
import { AssembleCommand } from '../assemble/assemble.command';

@Command({
  matches: ['vote-wiz'],
  ...prefixedCommandRuleTemplate
})
export class VoteCommand implements CommandClass {
  /** Emojis to use as votes */
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

  /** Emoji letter equivalents */
  letterList = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k'
  ];

  /**
   * Command action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  async action(msg: Message, args: string[]) {
    // Blank vote configuration
    let currentVoteConfiguration: VoteConfig = {
      title: '',
      description: '',
      pingChoice: 'none',
      time: 60,
      voteOptions: [''],
      privacyChoice: 'public'
    };

    // Begin by asking for the vote title
    let currentStep: VoteWizardStep = VoteWizardStep.TITLE;

    await msg.author.send('You\'ve initiated the vote creation wizard. Type "stop" any time to cancel.');
    await msg.author.send('What is the name of this vote?');

    // Await messages
    const collector = new MessageCollector(msg.author.dmChannel, m => m.author.id === msg.author.id, {});

    collector.on('collect', async message => {
      // Cancel wizard on 'stop'
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
            'Description saved ✅\nShould this vote ping any users?\n\nPlease type either "staff", "ducks", "both", "cats", or "none"'
          );
          break;

        case VoteWizardStep.PING_CHOICE:
          let loweredContent = message.content.toLowerCase();

          switch (loweredContent) {
            case 'staff':
            case 'ducks':
            case 'cats':
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

          currentStep = VoteWizardStep.PRIVACY;
          await msg.author.send(
            `Time saved as ${currentVoteConfiguration.time}m ✅\nShould your vote be private or public? (type "private" or "public")`
          );
          await msg.author.send(
            `A private vote means that participants must vote using a command, and can only have one anonymous vote.\n` +
            `A public vote means that users vote with reactions, and can have one vote per option.`
          );
          break;

        case VoteWizardStep.PRIVACY:
          let loweredPrivacyChoice = message.content.toLowerCase();

          currentVoteConfiguration.privacyChoice = loweredPrivacyChoice === 'private' ? 'private' : 'public';

          currentStep = VoteWizardStep.CONFIRM;
          msg.author.send(
            `Privacy choice set to ${currentVoteConfiguration.privacyChoice} ✅`
          );

          const embed = this.embedFromVoteConfig(currentVoteConfiguration);
          if (embed === null) {
            collector.stop();
            return await msg.author.send(
              `Your description is too long!\n` +
              `Please try again with a shorter description. Vote wizard cancelled.`
            );
          }

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

  /**
   * Sends a vote embed to the cahnnel of a given message and tracks reactions
   * @param msg Original message that triggered the vote wizard
   * @param voteConfig Vote parameters
   */
  async sendVoteToChannel(msg: Message, voteConfig: VoteConfig) {
    // Construct the initial embed
    const embed = this.embedFromVoteConfig(voteConfig);

    // Ping necessary parties
    const assembleCommand = new AssembleCommand();
    const serverStaffRole = roleService.getRoleByID(serverIDs.roles.serverStaff);
    const communityCatsRoleID = roleService.getRoleByID(serverIDs.roles.communityCatsRoleID);

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
      case 'cats':
        await msg.channel.send(`${communityCatsRoleID}`);
        break;
    }

    const voteMessage: Message = <Message> await msg.channel.send(embed);

    // Give initial reactions to the message
    if (voteConfig.privacyChoice === 'public') {
      let voteEmojis = [];
      let i = 0;
      for (const opt of voteConfig.voteOptions) {
        await voteMessage.react(this.voteEmojiList[i]);
        voteEmojis.push(this.voteEmojiList[i]);
        ++i;
      }

      await msg.channel.send('This is a public vote. Please vote by reacting.');

      // Begin collecting reactions, only track emojis that belong to this vote
      const filter = reaction => voteEmojis.includes(reaction.emoji.name);
      const collector = voteMessage.createReactionCollector(filter, { time: voteConfig.time * 1000 * 60 });

      collector.on('end', async collected => {
        // Convert reactions into an array
        const reactions: MessageReaction[] = collected.array();

        // Tally up the votes
        let currentWinners = [];
        let currentWinnerCount = 0;

        reactions.forEach(reaction => {
          if (reaction.count > currentWinnerCount) {
            currentWinnerCount = reaction.count;
            currentWinners = [reaction.emoji.name];
          } else if (reaction.count === currentWinnerCount) {
            currentWinners.push(reaction.emoji.name);
          }
        });

        await msg.channel.send(`The ${voteConfig.title} vote has concluded!`);

        // Handle results
        if (currentWinners.length < 1) {
          await msg.channel.send('...no one voted lol');
        } else if (currentWinners.length === 1) {
          await msg.channel.send(`The winner of this vote is: ${voteConfig.voteOptions[this.voteEmojiList.indexOf(currentWinners[0])]}`);
        } else {
          // Combine tied vote
          let ties = [];
          currentWinners.forEach(winner => {
            const optIndex = this.voteEmojiList.indexOf(winner);
            ties.push(voteConfig.voteOptions[optIndex]);
          });

          await msg.channel.send(`The winner of this vote is tied between:\n\n${ties.join(', ')}`);
        }
      });
    } else {
      await msg.channel.send('This is a private, anonymous vote. Please vote by using `!vote A`, `!vote B`, etc.');

      let voteLetters = [];
      let i = 0;
      for (const opt of voteConfig.voteOptions) {
        voteLetters.push(this.letterList[i]);
        ++i;
      }

      const filter = message => message.content.indexOf('!vote') === 0;
      const collector = msg.channel.createMessageCollector(filter, { time: voteConfig.time * 1000 * 60 });

      let collectedMessages: { user: string, vote: string }[] = [];
      collector.on('collect', e => {
        let args = e.content.split(' ');
        if (!args[1] || !voteLetters.includes(args[1].toLowerCase())) {
          e.author.send(`You didn't include a valid vote option!`);
          return e.delete();
        }

        let changed = false;
        collectedMessages = collectedMessages.map(val => {
          if (val.user === e.member.displayName) {
            val.vote = args[1];
            changed = true;
          }

          return val;
        });

        if (changed) {
          e.author.send(`Your vote has been changed to ${args[1].toUpperCase()}!`);
        } else {
          collectedMessages.push({
            user: e.member.displayName,
            vote: args[1]
          });

          e.author.send(`Your vote has been recorded as a vote for ${args[1].toUpperCase()}!`);
        }

        e.delete();
      });

      collector.on('end', async () => {
        // Tally up the votes
        let voteResults = {};
        let currentWinners: string[] = [];
        let currentWinnerCount = 0;

        collectedMessages.forEach(vote => {
          if (voteResults[vote.vote]) {
            voteResults[vote.vote] = voteResults[vote.vote] + 1;
          } else {
            voteResults[vote.vote] = 1;
          }
        });

        Object.keys(voteResults).forEach(vote => {
          if (voteResults[vote] > currentWinnerCount) {
            currentWinnerCount = voteResults[vote];
            currentWinners = [vote.toUpperCase()];
          } else if (voteResults[vote] === currentWinnerCount) {
            currentWinners.push(vote.toUpperCase());
          }
        });

        await msg.channel.send(`The ${voteConfig.title} vote has concluded!`);

        // Handle results
        if (currentWinners.length < 1) {
          await msg.channel.send('...no one voted lol');
        } else if (currentWinners.length === 1) {
          await msg.channel.send(`The winner of this vote is: ${currentWinners[0]}`);
        } else {
          await msg.channel.send(`The winner of this vote is tied between:\n\n${currentWinners.join(', ')}`);
        }
      });
    }
  }

  /**
   * Transform a list of vote options into an organized list with matching emojis
   */
  embedFromVoteConfig(voteConfig: VoteConfig) {
    let title = voteConfig.title;
    let desc = '';

    voteConfig.voteOptions.forEach((vote, index) => {
      desc += `${this.voteEmojiList[index]} ${vote}\n\n`;
    });

    const embed = new RichEmbed({
      color: defaultEmbedColor,
      description: `${voteConfig.description}\n\n${desc}`,
      title,
      footer: {
        text: `This vote will be concluded in ${voteConfig.time}m`
      }
    });

    if (embed.description.length >= 2048) {
      return null;
    }

    return embed;
  }

  /**
   * Admin use only!
   * @param msg 
   * @param args
   */
  pre(msg: Message, args: string[]) {
    const isStaff = detectStaff(msg.member);
    const councilOfYarnChannel = channelService.getChannelByID(serverIDs.channels.councilOfYarnChannel);
    if (isStaff === 'admin' || (isStaff === 'cats' && msg.channel === councilOfYarnChannel)) {
      return true;
    }
    return false;
  }
}

interface VoteConfig {
  title: string;
  description: string;
  pingChoice: 'staff' | 'ducks' | 'both' | 'cats' | 'none';
  voteOptions: string[];
  time: number;
  privacyChoice: 'private' | 'public';
}

enum VoteWizardStep {
  TITLE,
  PING_CHOICE,
  DESCRIPTION,
  VOTE_OPTIONS,
  TIME,
  PRIVACY,
  CONFIRM
}

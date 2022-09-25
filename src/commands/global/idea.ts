import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { generate } from '../../misc/orteil-gamegen.js';

const command = new SlashCommandBuilder()
.setName('idea')
.setDescription(`Generates a random game idea using Orteil's Game Gen.`)
.addBooleanOption(option =>
  option
  .setName('insane')
  .setDescription('Do you want a *crazy* idea?')
  .setRequired(false)
);

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const insane = interaction.options.getBoolean('insane', false);

  const idea = generate(!!insane);

  const embed = new EmbedBuilder()
  .setColor(0x76428a)
  .setTitle(`${insane ? 'Insane ' : ''}Game Idea: ${idea}`)
  .setDescription(`Video game generator by [Orteil](https://orteil.dashnet.org/gamegen) 2012`)
  .setTimestamp(new Date());

  const reply = await interaction.reply({
    embeds: [embed],
    fetchReply: true
  });
  reply.react('👍');
  reply.react('👎');
}

export const cmd: BotCommand = {
  command,
  execute
};

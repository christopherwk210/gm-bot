import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export async function handleErrors(interaction: ChatInputCommandInteraction<CacheType>) {
  const errorMessage = 'There was an error while executing this command!';
  if (interaction.isRepliable()) {
    await interaction.reply({ content: errorMessage, ephemeral: true });
  } else if (interaction.deferred) {
    await interaction.editReply({ content: errorMessage });
  }
}

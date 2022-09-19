import {
  CacheType,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  time
} from 'discord.js';

const command = new SlashCommandBuilder()
.setName('lifetime')
.setDescription(`Tells you how long you've been part of this server`)
.addMentionableOption(option => 
  option
  .setName('member')
  .setDescription('The member to check the lifetime of')
  .setRequired(false)
);

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {
  if (!interaction.guild) return;
  await interaction.deferReply();

  const member = interaction.options.getMentionable('member') || interaction.member;
  if (member instanceof GuildMember) {
    const fetchedMember = await member.fetch();

    if (fetchedMember.joinedAt) {
      await interaction.editReply(`${fetchedMember.displayName} has been a member of this server since ${time(fetchedMember.joinedAt, 'F')}`);
    } else {
      await interaction.editReply(`I couldn't figure out how long this member has been a part of this server.`);
    }
  } else {
    await interaction.editReply('You must provide a valid member!');
  }
}

export { command, execute };

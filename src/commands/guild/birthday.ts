import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, SlashCommandBuilder } from 'discord.js';
import { detectStaff } from '@/misc/discord-utils.js';
import { db } from '@/database/db.js';
import { config } from '@/data/config.js';

const command = new SlashCommandBuilder()
.setName('birthday')
.setDescription(`Gives a user the birthday role for 24 hours`)
.addMentionableOption(option =>
  option
  .setName('member')
  .setDescription('The member we are celebrating')
  .setRequired(true)
);

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.guild || !interaction.channel || !interaction.member) return;
    if (detectStaff(interaction.member) !== 'admin') {
      await interaction.reply({
        content: `You don't have permission to do that!`,
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
  
    const member = interaction.options.getMentionable('member');
    if (member instanceof GuildMember) {
      const fetchedMember = await member.fetch();

      const alreadyHasBirthday = fetchedMember.roles.cache.has(config.discordIds.roles.birthday);
      if (alreadyHasBirthday) {
        await interaction.editReply({
          content: 'That member already has the birthday role! If you want to remove it, you can remove it manually via Discord. If you want to update their birthday to now, remove the role first and run this command again.'
        });
        return;
      }

      const addRoleResult = await fetchedMember.roles.add(config.discordIds.roles.birthday).catch(() => {});
      if (!addRoleResult) {
        await interaction.editReply({
          content: `I couldn't add this user's role, so the database wasn't updated. This should honestly never happen. You know what, if you see this, don't even tell me. Just try it again and pretend this never happened.`
        });
        return;
      }

      const { created } = await db.birthday.create(fetchedMember.user.id);
      if (created) {
        await interaction.editReply({
          content: `Success! I've given the member the birthday role, and added it to my database. In 24 hours, the role will be automatically removed.`
        });
      } else {
        await interaction.editReply({
          content: `This user already had a birthday entry in my database, so I updated the time to now. They've been given the role and it will be removed in 24 hours.`
        });
      }

      fetchedMember.send({
        content: `:tada: The **GameMaker Discord** wishes you a happy birthday! :tada:\n` +
          `You've been granted the shiny birthday role and colors for 24 hours.\n` +
          `Should you wish to remove it at any time before then, just click the button below.`,
        components: [
          new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('birthday-end')
            .setLabel('Remove role')
            .setStyle(ButtonStyle.Primary)
          )
        ]
      });
    } else {
      await interaction.editReply('You must provide a valid member!');
    }
  },
  button: {
    ids: ['birthday-end'],
    execute: async interaction => {
      await interaction.deferReply();
      const guild = await interaction.client.guilds.fetch(config.discordIds.guildId);
      const member = await guild.members.fetch({ user: interaction.user });
      
      const memberAlreadyHasRole = member.roles.cache.has(config.discordIds.roles.birthday);
      if (memberAlreadyHasRole) {
        await member.roles.remove(config.discordIds.roles.birthday);
        await interaction.editReply({
          content: `Your birthday role has been removed. See you next year!`
        });
      } else {
        await interaction.editReply({
          content: `You don't currently have the birthday role silly!`
        });
      }
    }
  }
};

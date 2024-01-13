import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction,
  EmbedBuilder,
  GuildMember,
  APIInteractionGuildMember
} from 'discord.js';
import { cjs } from '@/misc/node-utils.js';
import { config } from '@/data/config.js';
import type { parseDocs } from 'gm-docs-parser';

const { require } = cjs(import.meta.url);

type ParsedDocs = Extract<Awaited<ReturnType<typeof parseDocs>>, { success: true }>['docs'];

console.log('Caching docs keys...');

// Load the JSON and cache the key names
const data = require('../../docs-index.json') as ParsedDocs;
const docsKeys = Object.keys(data);

const command = new SlashCommandBuilder()
.setName('docs')
.setDescription(`Shows a specific GML documentation page`)
.addStringOption(option =>
  option
  .setName('keyword')
  .setDescription('The keyword you want to search for')
  .setRequired(true)
  .setAutocomplete(true)
);

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const keyword = interaction.options.getString('keyword')!;

  // Search for the matching entry based on the key the user provided
  const foundKey = docsKeys.find(key => key === keyword.toLowerCase());

  if (!foundKey) {
    await interaction.reply({
      content: `Could not find a documentation entry for ${keyword}.`,
      ephemeral: true
    });
    return;
  }

  if (data[foundKey].pages.length === 1) {
    const embed = constructEmbed(data[foundKey]);
    await interaction.reply({ embeds: [embed] });
  } else {
    // Create a select that has every topic in it
    const row = new ActionRowBuilder<SelectMenuBuilder>()
    .addComponents(
      new SelectMenuBuilder()
      .setCustomId(selectCustomId)
      .setPlaceholder('Select a topic...')
      .addOptions(
        ...data[foundKey].pages.map((page, pageIndex) => ({
          label: page.title,
          value: JSON.stringify([foundKey, pageIndex])
        }))
      )
    )

    await interaction.reply({
      content: 'This keyword has multiple pages! Please select one from the list:',
      ephemeral: true,
      components: [row]
    });
  }
}

async function autocomplete(interaction: AutocompleteInteraction<CacheType>): Promise<void> {
  const focusedValue = interaction.options.getFocused();
  
  // Filter to the first 6 commands
  const output: ApplicationCommandOptionChoiceData<string | number>[] = [];
  let count = 0;
  for (const key of docsKeys) {
    if (key.startsWith(focusedValue)) {
      output.push({ name: key, value: key });
      if (++count > 5) break;
    }
  }

  await interaction.respond(output);
}

const selectCustomId = 'docs-topic-select';

async function selectMenu(interaction: SelectMenuInteraction<CacheType>): Promise<void> {
  const [foundKey, pageIndex] = JSON.parse(interaction.values[0]);
  // const page = data[foundKey].pages[pageIndex];

  await interaction.update({
    content: `Page selected: ${foundKey}`,
    components: [],
  });

  const embed = constructEmbed(data[foundKey], pageIndex, interaction.member);
  await interaction.message.channel.send({ embeds: [embed] });
}

function constructEmbed(obj: ParsedDocs[string], pageIndex = 0, member: GuildMember | APIInteractionGuildMember | null = null): EmbedBuilder {
  const page = obj.pages[pageIndex];
  const title = obj.name;

  let description = page.blurb;
  if (page.args && page.args.length) {
    description += '\n\n**Arguments**\n';
    for (const arg of page.args) {
      description += `**${arg.argument}**: ${arg.description}\n`;
    }
  }

  const embed = new EmbedBuilder()
  .setTitle(title)
  .setColor(config.defaultEmbedColor)
  .setURL(page.url)
  .setDescription(description)
  .setThumbnail('https://coal.gamemaker.io/sites/5d75794b3c84c70006700381/assets/61af4f38fbbc0c000748de57/features-gml.jpg')
  .setTimestamp(new Date());
  
  if (member && member.user) {
    embed.setFooter({
      text: `This message was called for ${member.user.username}`
    });
  }

  return embed;
}

export const cmd: BotCommand = {
  command,
  execute,
  autocomplete,
  selectMenu: {
    ids: [selectCustomId],
    execute: selectMenu
  }
};

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

const { require } = cjs(import.meta.url);

// These interfaces correspond with the auto-generated JSON
// created by running `npm run docs:cache`

interface DocsKey {
  name: string;
  type: 'key';
  topics: DocsTopic[];
  keys: any[];
}

interface DocsTopic {
  name: string;
  type: 'topic';
  url: string;
  blurb: string;
  syntax?: string;
  args?: {
    argument: string;
    description: string;
  }[];
}

console.log('Caching docs keys...');

// Load the JSON and cache the key names
const data = require('../../docs-index.json');
const keys: DocsKey[] = data.keys;
const keyNames = keys.map(key => key.name);

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
  let foundIndex!: number;

  // Search for the matching entry based on the key the user provided
  const foundKey = keys.find((key, index) => {
    if (key.name === keyword.toLowerCase()) {
      foundIndex = index;
      return true;
    }

    return false;
  });

  if (!foundKey) {
    await interaction.reply({
      content: `Could not find a documentation entry for ${keyword}.`,
      ephemeral: true
    });
    return;
  }

  if (foundKey.topics.length === 1) {
    const embed = constructEmbed(foundKey);
    await interaction.reply({ embeds: [embed] });
  } else {
    // Create a select that has every topic in it
    const row = new ActionRowBuilder<SelectMenuBuilder>()
    .addComponents(
      new SelectMenuBuilder()
      .setCustomId(selectCustomId)
      .setPlaceholder('Select a topic...')
      .addOptions(
        ...foundKey.topics.map((topic, topicIndex) => ({
          label: topic.name,
          value: JSON.stringify([foundIndex, topicIndex])
        }))
      )
    )

    await interaction.reply({
      content: 'This keyword has multiple topics! Please select one from the list:',
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
  for (const key of keyNames) {
    if (key.startsWith(focusedValue)) {
      output.push({ name: key, value: key });
      if (++count > 5) break;
    }
  }

  await interaction.respond(output);
}

const selectCustomId = 'docs-topic-select';

async function selectMenu(interaction: SelectMenuInteraction<CacheType>): Promise<void> {
  const [keyIndex, topicIndex] = JSON.parse(interaction.values[0]);
  const key = keys[keyIndex];
  const topic = key.topics[topicIndex];

  await interaction.update({
    content: `Topic selected: ${topic.name}`,
    components: [],
  });

  const embed = constructEmbed(key, topicIndex, interaction.member);
  await interaction.message.channel.send({ embeds: [embed] });
}

function constructEmbed(key: DocsKey, topicIndex = 0, member: GuildMember | APIInteractionGuildMember | null = null): EmbedBuilder {
  const topic = key.topics[topicIndex];
  const title = key.name === topic.name ? (topic.syntax || key.name) : `${key.name} - ${topic.name}`;

  let description = topic.blurb;
  if (topic.args && topic.args.length) {
    description += '\n\n**Arguments**\n';
    for (const arg of topic.args) {
      description += `**${arg.argument}**: ${arg.description}\n`;
    }
  }

  const embed = new EmbedBuilder()
  .setTitle(title)
  .setColor(config.defaultEmbedColor)
  .setURL('https://manual.yoyogames.com/' + topic.url)
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

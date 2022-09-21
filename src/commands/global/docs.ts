import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction,
  EmbedBuilder
} from 'discord.js';
import { createRequire } from 'module';

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
}

console.log('Caching docs keys...');

const require = createRequire(import.meta.url);
const data = require('../../docs-index.json');
const keys: DocsKey[] = data.keys;
const keyNames = keys.map(key => key.name);

const selectCustomId = 'docs-topic-select';

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
  const foundKey = keys.find((key, index) => {
    if (key.name === keyword) {
      foundIndex = index;
      return true;
    }

    return false;
  })!;

  if (foundKey.topics.length === 1) {
    const embed = constructEmbed(foundKey);
    if (interaction.member && interaction.member.user) {
      embed.setFooter({
        text: `This message was called for ${interaction.member.user.username}`
      });
    }
    await interaction.reply({ embeds: [embed] });
  } else {
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

async function selectMenu(interaction: SelectMenuInteraction<CacheType>): Promise<void> {
  const [keyIndex, topicIndex] = JSON.parse(interaction.values[0]);
  const key = keys[keyIndex];
  const topic = key.topics[topicIndex];

  await interaction.update({
    content: `Topic selected: ${topic.name}`,
    components: [],
  });

  const embed = constructEmbed(key, topicIndex);
  if (interaction.member && interaction.member.user) {
    embed.setFooter({
      text: `This message was called for ${interaction.member.user.username}`
    });
  }
  
  await interaction.message.channel.send({ embeds: [embed] });
}

function constructEmbed(key: DocsKey, topicIndex = 0): EmbedBuilder {
  const topic = key.topics[topicIndex];
  const title = key.name === topic.name ? key.name : `${key.name} - ${topic.name}`;

  return new EmbedBuilder()
    .setTitle(title)
    .setColor(0x039e5c)
    .setURL('https://manual.yoyogames.com/' + topic.url)
    .setDescription(topic.blurb)
    .setThumbnail('https://coal.gamemaker.io/sites/5d75794b3c84c70006700381/assets/61af4f38fbbc0c000748de57/features-gml.jpg')
    .setTimestamp();
}

export const cmd: BotCommand = {
  command,
  execute,
  autocomplete,
  selectMenu: {
    handle: selectMenu,
    customId: selectCustomId
  }
};

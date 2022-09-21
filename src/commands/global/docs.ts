import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder
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
}

const require = createRequire(import.meta.url);
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
  const foundKey = keys.find(key => key.name === keyword)!;

  if (foundKey.topics.length === 1) {
    await interaction.reply('https://manual.yoyogames.com/' + foundKey.topics[0].url);
  } else {
    // TODO: HANDLE MULTIPLE TOPICS
  }
}

async function autocomplete(interaction: AutocompleteInteraction<CacheType>): Promise<void> {
  const focusedValue = interaction.options.getFocused();
  
  const output = [];
  let count = 0;
  for (const key of keyNames) {
    if (key.startsWith(focusedValue)) {
      output.push({ name: key, value: key });
      if (++count > 5) break;
    }
  }

  await interaction.respond(output);
}

export { command, execute, autocomplete };


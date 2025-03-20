import { APIEmbedField, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { cjs } from '@/misc/node-utils.js';
import { config } from '@/data/config.js';

const { require } = cjs(import.meta.url);
const resources: ResourceList = require('../../starter-resources.json');

const command = new SlashCommandBuilder()
.setName('starter-pack')
.setDescription(`Get a list of helpful resources`);

/** 
const embed = new EmbedBuilder()
.setColor(config.defaultEmbedColor)
.setTitle('__**GameMaker Resource Pack**__')
.setFields(constructEmbedFields(resources))
.setDescription('**The following is a set of useful sources for learning GML and other GameMaker development skills.**');

export interface ResourceList {
  [x: string]: {
    title: string;
    url: string;
    label?: string;
  }[];
}
 */
const starterPackMessage = `We have a thread in our FAQ channel that has anwers to questions we're often asked, for both within GameMaker and outside of it, which you can find here: [**# Getting Started**](https://discord.com/channels/262834612932182025/1351147798971809922)`;
const embed = new EmbedBuilder()
  .setColor(config.defaultEmbedColor)
  .setTitle(`__**GameMaker Resource Pack**__`)
  .setDescription(starterPackMessage)
  .setTimestamp(new Date())
  .setFooter({
    text: 'This is an automated message'
});

/**
 * Constructs a valid Discord embed fields array from a serialized resource list
 * @param resourcesList 
 */
/*
function constructEmbedFields(resourcesList: ResourceList): APIEmbedField[] {
  let fields: APIEmbedField[] = [];

  Object.keys(resourcesList).forEach(category => {
    let name = `**${category}**`;
    let value: string[] = [];

    resourcesList[category].forEach(field => {
      value.push(`${field.label ? field.label + ' ' : ''}[${field.title}](${field.url})`);
    });

    fields.push({ name, value: value.join('\n') });
  });

  return fields;
}
  */



export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    const user = interaction.user;
    
    await interaction.reply({
      content: starterPackMessage,
      ephemeral: true
    });
    
    await user.send({
      embeds: [embed]
    });
  }
};

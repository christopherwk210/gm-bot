import { SlashCommandBuilder,ChatInputCommandInteraction,AutocompleteInteraction,CacheType,ForumChannel, SnowflakeUtil } from 'discord.js';
import { client } from '@/singletons/client.js';
import { config } from '@/data/config.js';
import { EmbedBuilder } from '@discordjs/builders';

interface FAQManager {
  posts: {title: string, id: string}[],
  last_updated: number,
  channel: ForumChannel | null
}

const command = new SlashCommandBuilder()
.setName('faq')
.setDescription(`Look up an FAQ post`)
.addStringOption(option =>
  option
  .setName('faq')
  .setDescription('The FAQ post to look up')
  .setRequired(true)
  .setAutocomplete(true)
)

const faq: FAQManager = {
  posts: [],
  last_updated: 0,
  channel: null
}

const ONE_MINUTE = 1000 * 60;

async function getFaqPosts() {
  if (faq.last_updated + (ONE_MINUTE*10) < Date.now()) {
    faq.posts = [];
    if (faq.channel == null) {
      faq.channel = await client.channels.fetch(config.discordIds.channels.faq.forum) as ForumChannel;
    }
    
    const active = [...(await faq.channel.threads.fetchActive()).threads.values()];
    const archived = [...(await faq.channel.threads.fetchArchived({fetchAll: true})).threads.values()];

    const posts = [...active,...archived].sort((a,b)=>(SnowflakeUtil.timestampFrom(b.lastMessageId || '0')-SnowflakeUtil.timestampFrom(a.lastMessageId || '0')));

    for (let i=0;i<posts.length;i++) {
      for (let j=posts.length-1;j>i;j--) {
        if (posts[j].id == posts[i].id) {
          posts.splice(j,1);
          j-=1;
        }
      }
    }

    faq.posts.push(...posts.map(v=>({title: v.name, id: v.id})).filter(v=>v.id!=config.discordIds.channels.faq.directory));
    
  }
  return [...faq.posts];
}

async function getPostFirstMessage(id: string) {
  if (faq.channel == null) {
    return null;
  } else {
    const thread = await faq.channel.threads.fetch(id);
    const first = thread?.fetchStarterMessage();
    return first;
  }
}

async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
  if (!interaction.inGuild() || !interaction.guild)  return;
  if (!interaction.channel || !interaction.member) return;
  //if (!detectStaff(interaction.member)) return;

  await interaction.deferReply();

  const posts = await getFaqPosts();
  const id = interaction.options.getString('faq',true);
  const post = posts.find(v=>v.id === id);
  if (post == undefined) {
    await interaction.editReply(`Could not find requested post!`);
    return;
  }
  const msg = await getPostFirstMessage(id);
  if (msg === null || msg === undefined) {
    await interaction.editReply(`Could not fetch requested message`);
    return;
  }

  const chunk = msg.content.split('\n\n')[0];
  const num = Math.max(msg.attachments.size,1);

  const attachments = [];
  if (msg.attachments.size > 0) {
    for (const attachment of msg.attachments.values())
    attachments.push(attachment.url);
  }

  const url = `https://discord.com/channels/${config.discordIds.guildId}/${id}`;
  const embeds: EmbedBuilder[] = [];

  for (let i=0;i<num;i++) {
    const embed = new EmbedBuilder()
                        .setTitle(post.title)
                        .setDescription(chunk + `\n\nSee full post: <#${id}>`)
                        .setAuthor({name: msg.author.displayName, iconURL: msg.author.displayAvatarURL()})
                        .setColor(config.defaultEmbedColor)
                        .setURL(url);
    if (attachments.length > 0) {
      embed.setImage(attachments[i])
    }

    embeds.push(embed);
  }

  await interaction.editReply({embeds})
}

async function autocomplete(interaction: AutocompleteInteraction<CacheType>) {
  let posts = await getFaqPosts();
  const query = interaction.options.getString('faq',true).toLowerCase();
  if (query.length > 0) {
    posts = posts.filter(v=>v.title.toLowerCase().includes(query));
  }
  if (posts.length > 25) {
    posts = posts.slice(0,25);
  }
  
  interaction.respond(posts.map(v=>({name: v.title, value: v.id})));
}

export const cmd: BotCommand = {
  command,
  execute,
  autocomplete
};

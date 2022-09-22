import { Client, Guild, Message, NonThreadGuildBasedChannel } from 'discord.js';
import { config } from '../singletons/config.js';

interface HelpChannelState {
  /** Timestamp for when this channel should become un-busy */
  busyUntil: number;

  /** GuildChannel reference */
  channel: NonThreadGuildBasedChannel;

  /**
   * Who made the channel busy in the first place
   */
  culprit: string;

  /** Whether this channel is marked as busy or not */
  busy: boolean;
}

const busyRegex = /(?<=\d)[_]+busy$/g;
const helpChannelStates: HelpChannelState[] = [];
let helpChannelsCached = false;

export async function initHelpChannelHandler(client: Client<boolean>) {
  const guild = await client.guilds.fetch(config.discordIds.guildId);
  await cacheHelpChannels(guild);
  setupTimer();
}

function setupTimer() {
  setInterval(async () => {
    for (const state of helpChannelStates) {
      if (state.busy && Date.now() >= state.busyUntil) {
        await helpChannelSetUnbusy(state.channel.id);
      }
    }
  }, 1000 * 2);
}

export async function handleHelpChannelMessages(message: Message<boolean>) {
  if (!message.inGuild() || message.guildId !== config.discordIds.guildId) return;
  if (!message.author.id || message.author.bot || !helpChannelsCached) return;

  const helpChannelState = helpChannelStates.find(state => state.channel.id === message.channelId);
  if (!helpChannelState) return;

  helpChannelSetBusy(helpChannelState, message.author.id);
}

function helpChannelSetBusy(state: HelpChannelState, culprit: string) {
  state.busyUntil = Date.now() + config.helpChannelBusyTimeout;
  if (!state.busy) {
    state.busy = true;
    state.channel.setName(`${state.channel.name.replace(busyRegex, '')}__busy`);
    state.culprit = culprit;
  }
}

export async function helpChannelSetUnbusy(channelId: string) {
  const helpChannelState = helpChannelStates.find(state => state.channel.id === channelId);
  if (!helpChannelState) return false;

  const currentName = helpChannelState.channel.name;
  await helpChannelState.channel.setName(currentName.replace(busyRegex, '')).catch(e => console.log(e));
  // We might not reach here if we're rate limited!

  helpChannelState.busy = false;
  helpChannelState.culprit = '';
  return true;
}

function cacheHelpChannels(guild: Guild): Promise<void> {
  return new Promise(resolve => {
    if (helpChannelsCached) resolve();
    helpChannelsCached = true;

    let totalChannels = config.discordIds.channels.helpChannels.length;
    let channelsCached = 0;

    config.discordIds.channels.helpChannels.forEach(async helpChannelId => {
      const channel = await guild.channels.fetch(helpChannelId).catch(() => null);
      if (channel) {
        helpChannelStates.push({
          channel,
          culprit: '',
          busyUntil: 0,
          busy: channel.name.includes('__busy')
        });
      } else {
        console.log(`There was an error fetching help channel with id ${helpChannelId}`);
      }

      if (++channelsCached >= totalChannels) resolve();
    });
  });
}

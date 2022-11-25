import { Guild, SlashCommandBuilder } from 'discord.js';
import { detectStaff, getRole, getTextChannel } from '@/misc/discord-utils.js';
import { config } from '@/data/config.js';

const command = new SlashCommandBuilder()
.setName('christmas')
.setDescription(`Handle various merry tasks`)
.addStringOption(option =>
  option
  .setName('decree')
  .setDescription('What is your holiday decree?')
  .setRequired(true)
  .addChoices(
    { name: 'Begin color cycling', value: 'start' },
    { name: 'Stop color cycling', value: 'stop' },
    { name: 'Force a single cycle', value: 'cycle' },
    { name: 'Distribute roles', value: 'distribute' }
  )
);

/** Colors to cycle through */
const colors = {
  RED: '#ff0000',
  GREEN: '#009600',
  YELLOW: '#f1c40f'
};

/** Stores the cyclable roles and their current colors */
const roles = {
  A: {
    role: config.discordIds.roles.christmas.A,
    color: colors.RED
  },
  B: {
    role: config.discordIds.roles.christmas.B,
    color: colors.GREEN
  },
  C: {
    role: config.discordIds.roles.christmas.C,
    color: colors.YELLOW
  }
};

function setupRoles(guild: Guild) {
  guild.members.fetch().then(async members => {
    const keys = Object.keys(roles);
    let lastKey = keys[0];
    let success = 0;
    let failure = 0;
    for (const member of members.toJSON()) {
      const key = lastKey as ('A' | 'B' | 'C');

      try {
        await member.roles.add(roles[key].role);
        success++;
      } catch (e) {
        failure++;
      }

      if (keys.indexOf(lastKey) === keys.length - 1) {
        lastKey = keys[0];
      } else {
        lastKey = keys[keys.indexOf(lastKey) + 1];
      }
    }

    const botTestingChannel = await getTextChannel(config.discordIds.channels.botChannel);
    if (!!botTestingChannel) {
      botTestingChannel.send(`Christmas roles have been distributed.\n\nSuccess: ${success}\nFailure: ${failure}`);
    }
  });
}

/**
 * Cycles the christmas role colors. This is automatic,
 * and can handle any number of colors and roles. 
 */
function cycle() {
  // Turn all available colors into an array
  let colorArray = Object.values(colors);

  // Iterate over each role
  Object.keys(roles).forEach(async _ => {
    let key = _ as ('A' | 'B' | 'C')

    // Get the current color of this role
    let currentColor = roles[key].color;

    // Find it's index in the color array
    let currentIndex = colorArray.indexOf(currentColor);

    // Move the index up one or loop back to the start
    let newIndex = currentIndex === colorArray.length - 1 ? 0 : currentIndex + 1;

    // Assign the color with the new index
    roles[key].color = colorArray[newIndex];

    // Set the color of the role
    const role = await getRole(roles[key].role);
    if (role) role.setColor(roles[key].color as any);
  });
}

let cycleInterval: any;

function setAutoCycle(minutes: number = 15) {
  if (cycleInterval) clearInterval(cycleInterval);
  cycleInterval = setInterval(() => cycle(), (1000 * 60) * minutes);
}

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.inGuild() || !interaction.guild) return;
    if (!interaction.channel || !interaction.member) return;
    if (detectStaff(interaction.member) !== 'admin') {
      await interaction.reply({
        content: `You don't have permission to do that!`,
        ephemeral: true
      })
      return;
    }

    const decree = interaction.options.getString('decree', true);

    switch (decree) {
      case 'distribute':
        setupRoles(interaction.guild);
        await interaction.reply({
          content: 'Starting to distribute roles now. Check the bot testing channel in a little bit, I will report on how well it goes.'
        });
        break;
      case 'start':
        setAutoCycle();
        await interaction.reply({
          content: 'Commencing merriment.'
        });
        break;
      case 'stop':
        if (cycleInterval) clearInterval(cycleInterval);
        await interaction.reply({
          content: 'Stopping color cycles. No more colors.'
        });
        break;
      case 'cycle':
        cycle();
        await interaction.reply({
          content: 'Colors have been cycled!'
        });
        break;
    }
  }
};

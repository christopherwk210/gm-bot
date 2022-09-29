import { config } from '@/data/config.js';
import { db } from '@/database/db.js';
import { Client } from 'discord.js';

export function setupBirthdayTicker(client: Client<boolean>) {
  // Handle birthday operations once every 20 minutes
  setInterval(() => handleBirthdayOps(client), 60_000 * 20);
}

async function handleBirthdayOps(client: Client<boolean>) {
  const waitingForRemoval = await db.birthday.getAllPendingRemoval();
  for (const birthday of waitingForRemoval) {
    if (Date.now() > birthday.removalTimestamp) {
      try {
        await db.birthday.markAsRemoved(birthday.userId);
        const guild = await client.guilds.fetch(config.discordIds.guildId);
        const member = await guild.members.fetch({ user: birthday.userId });
        await member.roles.remove(config.discordIds.roles.birthday);
        await member.send('Your birthday role has been removed, see you next year!');
      } catch(e) {
        console.log(`Failed to automatically remove birthday role.`);
        console.log(e);
      }
    }
  }
}

import { tomorrow } from '@/misc/node-utils.js';
import { Snowflake } from 'discord.js';
import { Sequelize } from 'sequelize';
import { Birthday, createBirthdayModel } from './models/birthday.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'gmbot-db.sqlite',
  logging: false
});

export async function auth() {
  await sequelize.authenticate().catch(() => process.exit(1));
  await createBirthdayModel(sequelize);
  await sequelize.sync();
}

export const db = {
  birthday: {
    create: async (userId: Snowflake) => {
      const [ birthday ] = await Birthday.findOrCreate({
        where: { userId },
        defaults: { userId }
      });

      birthday.set({
        removalTimestamp: tomorrow(),
        birthday: Date.now()
      });

      return await birthday.save();
    }
  }
};

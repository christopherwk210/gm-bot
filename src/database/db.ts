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
      const [ birthday, created ] = await Birthday.findOrCreate({
        where: { userId },
        defaults: { userId }
      });

      birthday.set({
        removalTimestamp: tomorrow(),
        birthday: Date.now()
      });

      const savedBirthday = await birthday.save();

      return {
        birthday: savedBirthday,
        created
      };
    },

    getAllPendingRemoval: async () => {
      return await Birthday.findAll({ where: { needsRemoval: true } });
    },

    getAllNotPendingRemoval: async () => {
      return await Birthday.findAll({ where: { needsRemoval: false } });
    },

    markAsRemoved: async (userId: Snowflake) => {
      const birthday = await Birthday.findOne({ where: { userId } });
      if (birthday) {
        birthday.needsRemoval = false;
        await birthday.save();
      }
    }
  }
};

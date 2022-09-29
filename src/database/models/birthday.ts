import { tomorrow } from '@/misc/node-utils.js';
import { Sequelize, Model, DataTypes } from 'sequelize';

export class Birthday extends Model {
  declare userId: string;
  declare removalTimestamp: number;
  
  /**
   * This will be true if the user has the birthday
   * role and needs it removed at `removalTimestamp`
   */
  declare needsRemoval: boolean;

  /**
   * The user's birthday timestamp, indicates when
   * the birthday role will be reapplied to them
   * automatically
   */
  declare birthday: number;
}

export async function createBirthdayModel(sequelize: Sequelize) {
  Birthday.init({
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    needsRemoval: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    birthday: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    removalTimestamp: {
      type: DataTypes.DATE,
      defaultValue: tomorrow()
    }
  }, {
    sequelize,
    modelName: 'Birthday'
  });
}

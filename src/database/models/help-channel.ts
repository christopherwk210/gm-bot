import { Sequelize, Model, DataTypes } from 'sequelize';

export class HelpChannelData extends Model {
  declare channelId: string;
  declare busyTimestamp: number;
}

export async function createHelpChannelModel(sequelize: Sequelize) {
  HelpChannelData.init({
    channelId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    busyTimestamp: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'HelpChannelData'
  });
}

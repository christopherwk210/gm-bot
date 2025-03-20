import { Sequelize, Model, DataTypes } from 'sequelize';

export class UserToken extends Model {
  declare userId: string;
  declare tokens: number;
}

export async function createUserTokenModel(sequelize: Sequelize) {
  UserToken.init({
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'UserToken'
  });
}

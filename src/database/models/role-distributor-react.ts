import { Sequelize, Model, DataTypes } from 'sequelize';

export class RoleDistributorReactMessage extends Model {
  declare messageId: string;
}

export async function createRoleDistributorReactMessageModel(sequelize: Sequelize) {
  RoleDistributorReactMessage.init({
    messageId: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'RoleDistributorReactMessage'
  });
}

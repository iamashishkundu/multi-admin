const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class SubAdminPermission extends Model {}

SubAdminPermission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    subadminId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assignedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'SubAdminPermission',
    tableName: 'subadmin_permissions',
    timestamps: true,
  }
);

module.exports = SubAdminPermission;

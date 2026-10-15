const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class HelpTicket extends Model {}

HelpTicket.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assignedToId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'open',
      validate: {
        isIn: [['open', 'in_progress', 'resolved', 'closed']],
      },
    },
    priority: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: [['low', 'medium', 'high']],
      },
    },
    resolutionNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'HelpTicket',
    tableName: 'help_tickets',
    timestamps: true,
  }
);

module.exports = HelpTicket;

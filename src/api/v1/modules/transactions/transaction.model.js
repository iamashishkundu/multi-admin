const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class Transaction extends Model {}

Transaction.init(
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
    walletId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: {
        isIn: [['deposit', 'withdrawal', 'payment', 'refund', 'adjustment']],
      },
    },
    amount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('amount');
        return val === null ? 0.00 : parseFloat(val);
      },
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'completed',
      validate: {
        isIn: [['pending', 'completed', 'failed', 'refunded']],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
  }
);

module.exports = Transaction;

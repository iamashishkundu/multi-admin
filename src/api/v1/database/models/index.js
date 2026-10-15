const sequelize = require('../../config/database');

// Import all models from their respective modules
const User = require('../../modules/user/user.model');
const ModuleModel = require('../../modules/permissions/module.model');
const Permission = require('../../modules/permissions/permission.model');
const SubAdminPermission = require('../../modules/permissions/subadmin-permission.model');
const AuditLog = require('../../modules/admin/models/audit-log.model');
const Wallet = require('../../modules/wallets/wallet.model');
const Transaction = require('../../modules/transactions/transaction.model');
const Inventory = require('../../modules/inventory/inventory.model');
const Order = require('../../modules/orders/order.model');
const Notification = require('../../modules/notifications/notification.model');
const Faq = require('../../modules/faqs/faq.model');
const Setting = require('../../modules/settings/setting.model');
const HelpTicket = require('../../modules/help/help-ticket.model');

// Define all associations centrally

// 1. User <-> Wallet
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 2. User <-> Orders
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 3. User & Wallet <-> Transactions
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

// 4. Module <-> Permission
ModuleModel.hasMany(Permission, { foreignKey: 'moduleId', as: 'permissions' });
Permission.belongsTo(ModuleModel, { foreignKey: 'moduleId', as: 'module' });

// 5. User (Sub-admin) <-> SubAdminPermission <-> Permission
User.hasMany(SubAdminPermission, { foreignKey: 'subadminId', as: 'subadminPermissions' });
SubAdminPermission.belongsTo(User, { foreignKey: 'subadminId', as: 'subadmin' });

User.hasMany(SubAdminPermission, { foreignKey: 'assignedById', as: 'assignedBy' });
SubAdminPermission.belongsTo(User, { foreignKey: 'assignedById', as: 'assignedByUser' });

Permission.hasMany(SubAdminPermission, { foreignKey: 'permissionId', as: 'assignments' });
SubAdminPermission.belongsTo(Permission, { foreignKey: 'permissionId', as: 'permission' });

// 6. User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'actorId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

// 7. User <-> Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 8. User <-> HelpTicket (both as author and as assignee)
User.hasMany(HelpTicket, { foreignKey: 'userId', as: 'helpTickets' });
HelpTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(HelpTicket, { foreignKey: 'assignedToId', as: 'assignedTickets' });
HelpTicket.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

const models = {
  User,
  Module: ModuleModel,
  Permission,
  SubAdminPermission,
  AuditLog,
  Wallet,
  Transaction,
  Inventory,
  Order,
  Notification,
  Faq,
  Setting,
  HelpTicket,
  sequelize,
};

module.exports = models;

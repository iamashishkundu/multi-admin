const MODULE_PERMISSIONS_DEF = {
  'user-mgmt': {
    name: 'User Management',
    description: 'Manage standard users in the system',
    actions: ['create', 'read', 'update', 'delete'],
  },
  'subadmin-mgmt': {
    name: 'Sub-admin Management',
    description: 'Manage sub-admin accounts and permissions',
    actions: ['create', 'read', 'update', 'delete'],
  },
  'orders': {
    name: 'Order Management',
    description: 'Manage and update customer orders',
    actions: ['create', 'read', 'update', 'delete', 'cancel', 'update-status'],
  },
  'transactions': {
    name: 'Transaction Management',
    description: 'Inspect transaction records, refund and export ledger entries',
    actions: ['create', 'read', 'update', 'delete', 'refund', 'export'],
  },
  'wallet': {
    name: 'Wallet Operations',
    description: 'Perform wallet operations including balances, credits, debits, adjustments',
    actions: ['create', 'read', 'update', 'delete', 'credit', 'debit', 'adjust'],
  },
  'inventory': {
    name: 'Inventory Management',
    description: 'Manage items, product stock levels and stock adjustments',
    actions: ['create', 'read', 'update', 'delete', 'adjust-stock'],
  },
  'notifications': {
    name: 'Notification Service',
    description: 'Create and dispatch notifications and broadcasts',
    actions: ['create', 'read', 'update', 'delete', 'send'],
  },
  'faq': {
    name: 'FAQ Management',
    description: 'Manage knowledge base FAQs and publish articles',
    actions: ['create', 'read', 'update', 'delete', 'publish'],
  },
  'settings': {
    name: 'Application Settings',
    description: 'View and update system settings and configurations',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
  },
  'help': {
    name: 'Help & Support',
    description: 'Manage customer tickets, assignment, and resolutions',
    actions: ['create', 'read', 'update', 'delete', 'resolve', 'assign'],
  },
};

module.exports = {
  MODULE_PERMISSIONS_DEF,
  MODULE_KEYS: Object.keys(MODULE_PERMISSIONS_DEF),
};

const express = require('express');

// Feature Module Routers
const authRoutes = require('./modules/auth/routes/auth.routes');
const userRoutes = require('./modules/user/routes/user.routes');
const adminRoutes = require('./modules/admin/routes/admin.routes');
const subadminRoutes = require('./modules/subadmin/routes/subadmin.routes');
const permissionsRoutes = require('./modules/permissions/routes/permissions.routes');
const ordersRoutes = require('./modules/orders/routes/orders.routes');
const transactionsRoutes = require('./modules/transactions/routes/transactions.routes');
const walletsRoutes = require('./modules/wallets/routes/wallets.routes');
const inventoryRoutes = require('./modules/inventory/routes/inventory.routes');
const notificationsRoutes = require('./modules/notifications/routes/notifications.routes');
const faqsRoutes = require('./modules/faqs/routes/faqs.routes');
const settingsRoutes = require('./modules/settings/routes/settings.routes');
const helpRoutes = require('./modules/help/routes/help.routes');

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v1 is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount Feature Modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/subadmins', subadminRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/orders', ordersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/wallets', walletsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/faqs', faqsRoutes);
router.use('/settings', settingsRoutes);
router.use('/help', helpRoutes);

module.exports = router;

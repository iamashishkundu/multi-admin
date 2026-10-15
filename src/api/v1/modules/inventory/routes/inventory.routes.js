const express = require('express');
const inventoryCatalogController = require('../controllers/inventory-catalog.controller');
const inventoryStockController = require('../controllers/inventory-stock.controller');
const { inventoryParamSchema, createInventorySchema, updateInventorySchema } = require('../validations/inventory-catalog.validation');
const { adjustStockSchema } = require('../validations/inventory-stock.validation');
const { listInventorySchema } = require('../validations/inventory-query.validation');
const validate = require('../../../middleware/validate');
const authenticate = require('../../../middleware/authenticate');
const authorizePermission = require('../../../middleware/authorizePermission');

const router = express.Router();
router.use(authenticate);

router.get('/', authorizePermission('inventory', 'read'), validate(listInventorySchema), inventoryCatalogController.listItems);
router.get('/:id', authorizePermission('inventory', 'read'), validate(inventoryParamSchema), inventoryCatalogController.getItemById);
router.post('/', authorizePermission('inventory', 'create'), validate(createInventorySchema), inventoryCatalogController.createItem);
router.patch('/:id', authorizePermission('inventory', 'update'), validate(updateInventorySchema), inventoryCatalogController.updateItem);
router.post('/:id/adjust-stock', authorizePermission('inventory', 'adjust-stock'), validate(adjustStockSchema), inventoryStockController.adjustStock);

module.exports = router;
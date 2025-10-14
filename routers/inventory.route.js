const { Router } = require("express");
const inveCtl = require('../controllers/inventory.controller')
const inveRouter = Router();

inveRouter.get('/summary', inveCtl.inventorySummary);

// Purchase
inveRouter.get('/purchase', inveCtl.addPurchasePage);
inveRouter.post('/purchase', inveCtl.addPurchase);

// Sale
inveRouter.get('/sale', inveCtl.addSalePage);
inveRouter.post('/sale', inveCtl.addSale);

// Report
inveRouter.get('/report', inveCtl.inventoryReport)

module.exports = inveRouter;
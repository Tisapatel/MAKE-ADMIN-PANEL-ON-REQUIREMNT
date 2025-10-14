const { Router } = require("express");
const dashCtl = require('../controllers/dashboard.controller');

const dashRouter = Router();

dashRouter.get('/', dashCtl.homePage);

module.exports = dashRouter;

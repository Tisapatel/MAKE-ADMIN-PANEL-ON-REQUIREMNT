const { Router } = require("express");
const userCtl = require('../controllers/dashboard.controller')
const userRouter = Router();

userRouter.get('/viewData', userCtl.viewUsers);

userRouter.get('/delete/:id', userCtl.deleteUser);

module.exports = userRouter;

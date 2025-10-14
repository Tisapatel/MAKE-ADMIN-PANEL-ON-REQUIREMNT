const { Router } = require("express");

const authRouter = require('../routers/auth.route');
const dashRouter = require('../routers/dashboard.route');
const productRouter = require('../routers/products.route');
const cateRouter = require("../routers/category.route");
const subCateRouter = require('../routers/subCategory.route');
const userRouter = require('../routers/user.route');
const inveRouter = require('../routers/inventory.route')

const router = Router();

router.use('/', authRouter);
router.use('/dashboard', dashRouter);
router.use('/product', productRouter);
router.use('/category', cateRouter);
router.use('/subcategory', subCateRouter);
router.use('/user', userRouter);
router.use('/inventory', inveRouter);

module.exports = router;
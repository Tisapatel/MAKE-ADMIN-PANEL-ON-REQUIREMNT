const { Router } = require("express");
const { singleCloud } = require("../middlewares/upload");
const categoryCtl = require('../controllers/category.controller')
const cateRouter = Router();


// Category Routes
cateRouter.get('/create', categoryCtl.addCategoryPage);
cateRouter.post('/create', singleCloud("image", "categories"), categoryCtl.addCategory);

cateRouter.get('/viewcategory', categoryCtl.viewCategory);

// Delete
cateRouter.get('/delete/:id', categoryCtl.deleteCategory);

// Edit
cateRouter.get('/edit/:id', categoryCtl.editCategory);
cateRouter.post('/edit/:id',singleCloud("image", "categories"), categoryCtl.updateCategory);
module.exports = cateRouter;
const { Router } = require("express");
const subCatCtl = require('../controllers/subCategory.controller');
const { singleCloud } = require("../middlewares/upload");
const subCateRouter = Router();

subCateRouter.get('/create', subCatCtl.addSubCategorypage);
subCateRouter.post('/create', singleCloud("image", "subcategories"), subCatCtl.addSubCategory);


subCateRouter.get('/viewsubcategory', subCatCtl.viewSubCategory);
subCateRouter.get('/delete/:id', subCatCtl.deleteSubcategory);

subCateRouter.get('/edit/:id', subCatCtl.editSubcategory);
subCateRouter.post('/edit/:id',singleCloud("image", "subcategories"), subCatCtl.updateSubcategory);

module.exports = subCateRouter;
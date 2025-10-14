const { Router } = require("express");
const productCtl = require('../controllers/product.controller');
const { singleCloud, multipleCloud } = require('../middlewares/upload');
const Category = require("../models/category.model");
const Products = require("../models/product.models");
const SubCategory = require("../models/subCategory.model");
const productRouter = Router();

// Product Routes
productRouter.get('/create', productCtl.addproductPage);
productRouter.post('/create', multipleCloud("images", 6, "products"), productCtl.addproduct);

productRouter.get('/view', productCtl.viewProduct);

productRouter.get('/delete/:id', productCtl.deleteProduct);

// Edit
productRouter.get('/edit/:id', productCtl.editProductPage);
productRouter.post('/edit/:id',multipleCloud('images', 6, 'products'), productCtl.updateProduct);

productRouter.get('/search', async (req, res) => {
  try {
    const query = req.query.q?.trim() || '';

    // Find matching categories and subcategories by name
    const categories = await Category.find({
      name: { $regex: query, $options: 'i' }
    });

    const subCategories = await SubCategory.find({
      name: { $regex: query, $options: 'i' }
    });

    // Collect their IDs
    const categoryIds = categories.map(c => c._id);
    const subCategoryIds = subCategories.map(s => s._id);

    // Find products matching name, category, or subcategory
    const products = await Products.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $in: categoryIds } },
        { subCategory: { $in: subCategoryIds } }
      ]
    })
      .populate('category')
      .populate('subCategory');

    res.render('./products/searchResults', { products, query });

  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});


productRouter.get('/view/:id', productCtl.viewSingleProduct)
module.exports = productRouter;
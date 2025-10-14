const Products = require("../models/product.models");
const cloudinary = require('../configs/cloudinary');
const SubCategory = require("../models/subCategory.model");
const Category = require("../models/category.model");

exports.addproductPage = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const subCategories = await SubCategory.find().populate("category").lean();

    res.render("./products/addProduct", {
      categories,
      subCategories,
      product: null,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg")
    });
  } catch (error) {
    console.error("Add Product Page Error:", error.message);
    req.flash("error_msg", "Error loading product form.");
    res.redirect("/dashboard");
  }
};

// Add Product
exports.addproduct = async (req, res) => {
  try {
    const imageUrls = req.files?.map(f => f.url) || [];

    req.body.isAvailable = req.body.isAvailable === "true";

    if (req.body.technicalDetails) {
      try {
        req.body.technicalDetails = JSON.parse(req.body.technicalDetails);
      } catch {
        req.body.technicalDetails = { info: req.body.technicalDetails };
      }
    }

    await Products.create({
      ...req.body,
      images: imageUrls
    });

    req.flash("success_msg", "Product created & uploaded to Cloudinary!");
    res.redirect(req.get("Referrer") || "/");
  } catch (error) {
    console.error("Product Add Error:", error.message);
    req.flash("error_msg", "Failed to create product.");
    res.redirect(req.get("Referrer") || "/");
  }
};

exports.viewProduct = async (req, res) => {
  try {
    // Populate category & subCategory for better display
    const products = await Products.find({})
      .populate("category", "name image")
      .populate("subCategory", "name image")
      .sort({ createdAt: -1 }); // recent first

    res.render("./products/viewProducts", { products });
  } catch (error) {
    console.error("View Products Error:", error.message);
    req.flash("error_msg", "Could not fetch products");
    res.redirect("/dashboard");
  }

};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Products.findById(id);
    if (!product) {
      req.flash("error_msg", "Product not found");
      return res.redirect(req.get("Referrer") || "/dashboard/products");
    }

    if (product.images && product.images.length > 0) {
      const getPublicId = url => {
        const segments = url.split("/");
        const fileName = segments[segments.length - 1].split(".")[0];
        return `products/${fileName}`;
      };

      const deletePromises = product.images.map(imgUrl =>
        cloudinary.uploader.destroy(getPublicId(imgUrl))
          .catch(err => console.error("Cloudinary delete error:", err.message))
      );

      await Promise.all(deletePromises);
    }
    await Products.findByIdAndDelete(id);

    req.flash("success_msg", "Product deleted successfully");
    res.redirect(req.get("Referrer") || "/");
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    req.flash("error_msg", "Could not delete product");
    res.redirect(req.get("Referrer") || "/");
  }
}

exports.editProductPage = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id)
      .populate('category')
      .populate('subCategory');
    if (!product) return res.redirect(req.get('Referrer') || '/');

    const categories = await Category.find({});
    const subCategories = await SubCategory.find({});
    res.render('./products/editProduct', {
      product,
      categories,
      subCategories
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Something went wrong');
    return res.redirect(req.get('Referrer') || '/');
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/product/view');
    }

    const updateData = { ...req.body };

    updateData.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === 'on';

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => f.url);
    }

    Object.assign(product, updateData);

    await product.save();

    req.flash('success_msg', 'Product updated successfully');
    res.redirect('/product/view');

  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Something went wrong');
    return res.redirect(req.get('Referrer') || '/');
  }
}

exports.viewSingleProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id)
      .populate('category')
      .populate('subCategory');

    if (!product) {
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/product/view');
    }

    res.render('./products/viewSingleProduct', { product });

  } catch (error) {
    console.error('Error viewing product:', error);
    req.flash('error_msg', 'Something went wrong while loading product details.');
    res.redirect('/product/view');
  }
}
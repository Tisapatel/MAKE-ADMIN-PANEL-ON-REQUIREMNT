const Products = require("../models/product.models");
const Category = require("../models/category.model");
const SubCategory = require("../models/subCategory.model");
const User = require("../models/user.model");

exports.homePage = async (req, res) => {
  try {
    const totalProducts = await Products.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalSubCategories = await SubCategory.countDocuments();
    const totalUsers = await User.countDocuments();

    res.render("index", {
      totalProducts,
      totalCategories,
      totalSubCategories,
      totalUsers,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.render("index", {
      totalProducts: 0,
      totalCategories: 0,
      totalSubCategories: 0,
      totalUsers: 0,
    });
  }
}

exports.viewUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    return res.render('./users/viewUsers', { users })
  } catch (error) {
    console.log(error.message);
    return res.render('./users/viewUsers', { users: [] })
  }
}

// DeleteUser
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    req.flash('success_msg', 'User deleted successfully!');
    res.redirect('/user/viewData');
  } catch (error) {
    console.error('Error Edting category:', error);
    req.flash('error_msg', 'Something went wrong while deleting User.');
    res.redirect(req.get('Referrer') || '/');
  }
}
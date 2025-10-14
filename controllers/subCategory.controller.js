const Category = require("../models/category.model");
const SubCategory = require("../models/subCategory.model");

exports.addSubCategorypage = async (req, res) => {
  try {
    const categories = await Category.find({}, 'name');
    res.render("./subCategory/addSubCategory", {
      categories,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg")
    });
  } catch (error) {
    console.error("SubCategory Page Error:", error.message);
    req.flash("error_msg", "Failed to load subcategory form.");
    res.redirect("/");
  }
};

// Add Subcategory
exports.addSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name?.trim() || !category) {
      req.flash("error_msg", "Both name and category are required");
      return res.redirect(req.get("Referrer") || "/");
    }

    const imageUrl = req.file?.url || "";

    await SubCategory.create({
      name: name.trim(),
      category,
      image: imageUrl
    });

    req.flash("success_msg", "Subcategory added successfully!");
    res.redirect(req.get("Referrer") || "/");
  } catch (error) {
    console.error("Add SubCategory Error:", error.message);
    req.flash("error_msg", "Could not create subcategory");
    res.redirect(req.get("Referrer") || "/");
  }
};


exports.viewSubCategory = async(req,res) => {
    try {
        const subCategories = await SubCategory.find().sort({ name: 1 });
        return res.render('./subCategory/viewSubcategory', { subCategories });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Unable to fetch categories');
        return res.redirect('/dashboard');
    }
}

exports.deleteSubcategory = async (req,res) =>{
    try {
        const { id } = req.params;

        await SubCategory.findByIdAndDelete(id);
        req.flash('success_msg', 'SubCategory deleted successfully!');
        res.redirect('/subcategory/viewSubcategory');
    } catch (error) {
        console.error('Error deleting category:', error);
        req.flash('error_msg', 'Something went wrong while deleting category.');
        res.redirect('/subcategory/viewSubcategory');
    }
}

exports.editSubcategory = async(req,res) => {
    try {
        const { id } = req.params;

        const subCategory = await SubCategory.findById(id);

        res.render('./subCategory/editSubCategory', { subCategory });
        
    } catch (error) {
        console.error('Error Edting subCategory:', error);
        req.flash('error_msg', 'Something went wrong while deleting subCategory.');
        res.redirect(req.get('Referrer') || '/');
    }
};

exports.updateSubcategory = async(req,res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id);
        const updateData = { ...req.body };

        if (req.file) {
            // Delete old image from Cloudinary
            if (subCategory.imageId) {
                await cloudinary.uploader.destroy(subCategory.imageId);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'subCategories',
            });

            updateData.image = result.secure_url;
            updateData.imageId = result.public_id;
        }

        await SubCategory.findByIdAndUpdate(req.params.id, updateData, { new: true });

        req.flash('success_msg', 'SubCategory updated successfully.');
        res.redirect('/subcategory/viewSubcategory');

    } catch (error) {
        console.error('Error Edting category:', error);
        req.flash('error_msg', 'Something went wrong while deleting category.');
        res.redirect(req.get('Referrer') || '/');
    }
}
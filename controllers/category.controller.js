const { cloudinary } = require("../configs/cloudinary");
const Category = require("../models/category.model");

exports.addCategoryPage = (req, res) => {
    res.render("./category/addCategory", {
        success_msg: req.flash("success_msg"),
        error_msg: req.flash("error_msg")
    });
};

// Add Category
exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name?.trim()) {
            req.flash("error_msg", "Category name is required");
            return res.redirect(req.get("Referrer") || "/");
        }

        const imageUrl = req.file?.url || "";

        await Category.create({
            name: name.trim(),
            image: imageUrl
        });

        req.flash("success_msg", "Category added successfully!");
        res.redirect(req.get("Referrer") || "/");
    } catch (error) {
        console.error("Add Category Error:", error.message);
        req.flash("error_msg", "Could not create category");
        res.redirect(req.get("Referrer") || "/");
    }
};

// Category
exports.viewCategory = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return res.render('./category/viewCategory', {
            categories,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')

        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Unable to fetch categories');
        return res.redirect('/dashboard');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await Category.findByIdAndDelete(id);

        req.flash('success_msg', 'Category deleted successfully!');
        res.redirect('/category/viewcategory');
    } catch (error) {
        console.error('Error deleting category:', error);
        req.flash('error_msg', 'Something went wrong while deleting category.');
        res.redirect('/category/viewcategory');
    }
};

exports.editCategory = async(req,res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        res.render('./category/editCategory', { category });
        
    } catch (error) {
        console.error('Error Edting category:', error);
        req.flash('error_msg', 'Something went wrong while deleting category.');
        res.redirect(req.get('Referrer') || '/');
    }
}

exports.updateCategory = async(req,res) => {
    try {
        const category = await Category.findById(req.params.id);
        const updateData = { ...req.body };

        if (req.file) {
            // Delete old image from Cloudinary
            if (category.imageId) {
                await cloudinary.uploader.destroy(category.imageId);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'categories',
            });

            updateData.image = result.secure_url;
            updateData.imageId = result.public_id;
        }

        await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });

        req.flash('success_msg', 'Category updated successfully.');
        res.redirect('/category/viewcategory');

    } catch (error) {
        console.error('Error Edting category:', error);
        req.flash('error_msg', 'Something went wrong while deleting category.');
        res.redirect(req.get('Referrer') || '/');
    }
}
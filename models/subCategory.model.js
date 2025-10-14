const { default: mongoose } = require("mongoose");

const subCategorySchema = new mongoose.Schema({
    name: String,
    image: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    }
}, {
    timestamps: true
});


const SubCategory = mongoose.model('subCategory', subCategorySchema);

module.exports = SubCategory;
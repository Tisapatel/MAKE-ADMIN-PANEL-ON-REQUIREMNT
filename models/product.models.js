const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    sku: String,
    description: String,
    price: Number,
    discount: Number,
    brand: String,
    modelNumber: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategory'
    },
    stock: Number,
    batchNumber: String,
    expiryDate: Date,
    images: [String],
    manufacturer: String,
    dimensions: String,
    warranty: String,
    shippingInfo: String,
    technicalDetails: Object,
    isAvailable: { type: Boolean, default: true },
}, {
    timestamps: true
});


const Products = mongoose.model('products', productSchema);

module.exports = Products;
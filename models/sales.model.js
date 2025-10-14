const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'products', 
        required: true 
    },
    quantity: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    customer: { type: String, required: true },
    remarks: String               
}, { timestamps: true });

const Sale = mongoose.model('sales', saleSchema);

module.exports = Sale;
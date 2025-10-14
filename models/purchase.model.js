const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'products', // reference your Products model
        required: true 
    },
    quantity: { type: Number, required: true },
    supplier: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    batchNumber: String,          
    expiryDate: Date,             
    remarks: String               
}, { timestamps: true });

const Purchase = mongoose.model('purchases', purchaseSchema);

module.exports = Purchase;
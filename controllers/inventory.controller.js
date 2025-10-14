const Products = require("../models/product.models");
const Purchase = require("../models/purchase.model");
const Sale = require("../models/sales.model");

exports.inventorySummary = async (req, res) => {
    try {
        const products = await Products.find()
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .lean();

        const inStockCount = products.filter(p => p.stock > 0).length;
        const outOfStockCount = products.filter(p => p.stock <= 0).length;

        res.render('./products/inventorySummary', {
            products,
            inStockCount,
            outOfStockCount
        });
    } catch (err) {
        console.error(error);
        return res.redirect(req.get('Referrer') || '/');
    }
}

// Purchase
exports.addPurchasePage = async (req, res) => {
    try {
        const products = await Products.find();
        return res.render('./inventories/addPurchase', { products })
    } catch (error) {
        console.error(error);
        return res.redirect(req.get('Referrer') || '/');
    }
}

exports.addPurchase = async (req, res) => {
    try {
        const { productId, quantity, supplier, purchasePrice, batchNumber, expiryDate, remarks } = req.body;

        // 1️⃣ Find product
        const product = await Products.findById(productId);
        if (!product) {
            req.flash('error_msg', 'Product not found!');
            return res.redirect('/inventory/purchase/new');
        }

        // 2️⃣ Create purchase entry
        await Purchase.create({
            product: productId,
            quantity,
            supplier,
            purchasePrice,
            batchNumber,
            expiryDate,
            remarks
        });

        // 3️⃣ Update product stock
        product.stock = (product.stock || 0) + Number(quantity);
        product.isAvailable = product.stock > 0;
        await product.save();

        req.flash('success_msg', 'Purchase added and stock updated successfully!');
        res.redirect('/inventory/report');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Server error!');
        res.redirect('/inventory/purchase');
    }
};


// sale
exports.addSalePage = async (req, res) => {
    try {
        const products = await Products.find();
        return res.render('./inventories/addSale', { products })
    } catch (error) {
        console.error(error);
        return res.redirect(req.get('Referrer') || '/');
    }
}

exports.addSale = async (req, res) => {
    try {
        const { productId, quantity, sellingPrice, customer, remarks } = req.body;
        const product = await Products.findById(productId);
        if (!product) {
            req.flash('error_msg', 'Product not found!');
            return res.redirect('/inventory/sale/new');
        }

        // Check stock
        if (product.stock < Number(quantity)) {
            req.flash('error_msg', 'Insufficient stock!');
            return res.redirect('/inventory/sale/new');
        }

        // Create sale entry
        await Sale.create({
            product: productId,
            quantity: Number(quantity),
            sellingPrice: Number(sellingPrice),
            customer,
            remarks
        });

        // Deduct stock
        product.stock -= Number(quantity);
        product.isAvailable = product.stock > 0;
        await product.save();

        req.flash('success_msg', 'Sale added and stock updated!');
        return res.redirect('/inventory/report');

    } catch (error) {
        console.error(error);
        return res.redirect(req.get('Referrer') || '/');
    }
}

exports.inventoryReport = async (req, res) => {
    try {
        const products = await Products.find().populate('category').populate('subCategory');
        const purchases = await Purchase.find().populate('product');
        const sales = await Sale.find().populate('product');

        // Prepare report per product
        const report = products.map(p => {
            const totalPurchased = purchases
                .filter(pr => pr.product._id.equals(p._id))
                .reduce((sum, pr) => sum + pr.quantity, 0);

            const totalSold = sales
                .filter(s => s.product._id.equals(p._id))
                .reduce((sum, s) => sum + s.quantity, 0);

            return {
                product: p.name,
                sku: p.sku,
                category: p.category?.name || '-',
                subCategory: p.subCategory?.name || '-',
                stock: p.stock,
                totalPurchased,
                totalSold,
                isAvailable: p.isAvailable
            };
        });

        res.render('./inventories/inventoryReport', { report });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}
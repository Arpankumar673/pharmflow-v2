const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');

// @desc    Create a new sale (Bill)
// @route   POST /api/billing
// @access  Private
exports.createSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, customerName, customerPhone, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: 'Please add items to bill'
            });
        }

        let originalSubtotal = 0;
        let totalDiscount = 0;
        const processedItems = [];
        const pharmacyId = req.user.pharmacy;

        // Fetch pharmacy preferences for discount
        const pharmacy = await Pharmacy.findById(pharmacyId).session(session);
        const discountPercentage = pharmacy.preferences?.discountPercentage || 0;

        // Validate items and check stock
        for (const item of items) {
            if (item.manual) {
                // Manual item processing
                const unitPrice = Number(item.price);
                const discountAmount = (unitPrice * discountPercentage) / 100;
                const finalUnitPrice = unitPrice - discountAmount;

                originalSubtotal += (unitPrice * item.quantity);
                totalDiscount += (discountAmount * item.quantity);

                processedItems.push({
                    medicine: null, // No reference
                    name: item.name,
                    quantity: item.quantity,
                    price: finalUnitPrice,
                    originalPrice: unitPrice,
                    discountApplied: discountAmount,
                    manual: true
                });
            } else {
                // Ensure medicine belongs to this pharmacy
                const medicine = await Medicine.findOne({ _id: item.id, pharmacy: pharmacyId }).session(session);

                if (!medicine) {
                    throw new Error(`Medicine ${item.id} not found in your pharmacy`);
                }

                if (medicine.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`);
                }

                // Apply global discount
                const unitPrice = medicine.sellingPrice;
                const discountAmount = (unitPrice * discountPercentage) / 100;
                const finalUnitPrice = unitPrice - discountAmount;
                
                originalSubtotal += (unitPrice * item.quantity);
                totalDiscount += (discountAmount * item.quantity);

                processedItems.push({
                    medicine: medicine._id,
                    name: medicine.name,
                    quantity: item.quantity,
                    price: finalUnitPrice,
                    originalPrice: unitPrice,
                    discountApplied: discountAmount,
                    manual: false
                });

                // Update medicine stock atomically within transaction
                await Medicine.updateOne(
                    { _id: medicine._id },
                    { $inc: { quantity: -item.quantity } },
                    { session }
                );
            }
        }

        const netSubtotal = originalSubtotal - totalDiscount;
        const tax = Math.round(netSubtotal * 0.12); // 12% GST
        const grandTotal = netSubtotal + tax;

        const saleArray = await Sale.create([{
            customerName,
            customerPhone,
            items: processedItems,
            totalAmount: originalSubtotal,
            totalDiscount,
            tax,
            grandTotal,
            paymentMethod,
            soldBy: req.user.id,
            pharmacy: pharmacyId
        }], { session });

        const sale = saleArray[0];

        // Commit all changes
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            data: sale
        });
    } catch (err) {
        // Rollback on any failure
        await session.abortTransaction();
        session.endSession();

        res.status(400).json({
            success: false,
            error: err.message || 'Billing failed'
        });
    }
};

// @desc    Get all sales (History)
// @route   GET /api/billing/history
// @access  Private
exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find({ pharmacy: req.user.pharmacy }).populate('soldBy', 'name').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: sales.length,
            data: sales
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get single sale details
// @route   GET /api/billing/:id
// @access  Private
exports.getSale = async (req, res) => {
    try {
        const sale = await Sale.findOne({
            _id: req.params.id,
            pharmacy: req.user.pharmacy
        }).populate('soldBy', 'name');

        if (!sale) {
            return res.status(404).json({
                success: false,
                error: 'Sale records not found'
            });
        }

        res.status(200).json({
            success: true,
            data: sale
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

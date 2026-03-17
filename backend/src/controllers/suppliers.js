const Supplier = require('../models/Supplier');

// Helper: safely extract pharmacy ObjectId whether it's populated or a raw ref
const pharmacyId = (user) => user.pharmacy?._id ?? user.pharmacy;

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({ pharmacy: pharmacyId(req.user) });

        res.status(200).json({
            success: true,
            count: suppliers.length,
            data: suppliers
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Add supplier
// @route   POST /api/suppliers
// @access  Private/PharmacyOwner
exports.addSupplier = async (req, res) => {
    try {
        req.body.pharmacy = pharmacyId(req.user);
        const supplier = await Supplier.create(req.body);

        res.status(201).json({
            success: true,
            data: supplier
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/PharmacyOwner
exports.updateSupplier = async (req, res) => {
    try {
        let supplier = await Supplier.findOne({
            _id: req.params.id,
            pharmacy: pharmacyId(req.user)
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                error: 'Supplier not found'
            });
        }

        supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: supplier
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/PharmacyOwner
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            pharmacy: pharmacyId(req.user)
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                error: 'Supplier not found'
            });
        }

        await supplier.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

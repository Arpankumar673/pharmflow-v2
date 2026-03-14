const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const Pharmacy = require('../models/Pharmacy');

// @desc    Get system settings/preferences
// @route   GET /api/settings
// @access  Private/Owner
exports.getPreferences = async (req, res) => {
    try {
        let pharmacy = await Pharmacy.findById(req.user.pharmacy);

        if (!pharmacy) {
            const User = require('../models/User'); // Import dynamically or at top
            const user = await User.findById(req.user._id || req.user.id);
            pharmacy = await Pharmacy.create({
                name: "My Pharmacy",
                ownerName: user ? user.name : "System",
                email: user ? user.email : `auto-${Date.now()}@example.com`,
                phone: user ? (user.phone || "0000000000") : "0000000000",
                address: "Not configured yet",
                preferences: {
                    currency: "INR",
                    timezone: "UTC",
                    stockThreshold: 10,
                    defaultDiscount: 0
                }
            });
            // Also update the user's pharmacy reference if they didn't have one
            if (!req.user.pharmacy && req.user._id) {
                const User = require('../models/User'); // Import dynamically or at top
                await User.findByIdAndUpdate(req.user._id, { pharmacy: pharmacy._id });
            }
            return res.status(200).json(pharmacy.preferences);
        }

        res.status(200).json(pharmacy.preferences);
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update system preferences
// @route   PUT /api/settings/preferences
// @access  Private/Owner
exports.updatePreferences = async (req, res) => {
    try {
        if (req.body.discountPercentage !== undefined) {
            if (req.body.discountPercentage < 0 || req.body.discountPercentage > 100) {
                return res.status(400).json({
                    success: false,
                    error: "Discount must be between 0 and 100."
                });
            }
        }

        let pharmacy = await Pharmacy.findById(req.user.pharmacy);

        if (!pharmacy) {
            const User = require('../models/User');
            const user = await User.findById(req.user._id || req.user.id);
            pharmacy = await Pharmacy.create({
                name: "My Pharmacy",
                ownerName: user ? user.name : "System",
                email: user ? user.email : `auto-${Date.now()}@example.com`,
                phone: user ? (user.phone || "0000000000") : "0000000000",
                address: "Not configured yet",
                preferences: {
                    currency: "INR",
                    timezone: "UTC",
                    stockThreshold: 10,
                    defaultDiscount: 0
                }
            });
            // Update user reference
            if (!req.user.pharmacy) {
                const User = require('../models/User');
                await User.findByIdAndUpdate(req.user._id, { pharmacy: pharmacy._id });
            }
        }

        pharmacy.preferences = {
            ...pharmacy.preferences,
            ...req.body
        };

        await pharmacy.save();

        res.status(200).json(pharmacy.preferences);
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Export pharmacy snapshot
// @route   GET /api/settings/export-snapshot
// @access  Private/Owner
exports.exportSnapshot = async (req, res) => {
    try {
        const medicines = await Medicine.find({ pharmacy: req.user.pharmacy });
        const sales = await Sale.find({ pharmacy: req.user.pharmacy });

        res.json({
            timestamp: new Date(),
            pharmacyId: req.user.pharmacy,
            inventory: medicines,
            sales: sales
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

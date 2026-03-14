const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    durationMonths: {
        type: Number,
        required: true,
        min: 1
    },
    type: {
        type: String,
        enum: ['percentage', 'free'],
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    maxUses: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);

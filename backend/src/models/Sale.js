const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    customerName: {
        type: String,
        default: 'Walking Customer'
    },
    customerPhone: {
        type: String,
        default: ''
    },
    items: [{
        medicine: {
            type: mongoose.Schema.ObjectId,
            ref: 'Medicine',
            default: null
        },
        name: String,
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        originalPrice: Number,
        discountApplied: Number,
        manual: {
            type: Boolean,
            default: false
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    totalDiscount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Other'],
        default: 'Cash'
    },
    soldBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    pharmacy: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sale', saleSchema);

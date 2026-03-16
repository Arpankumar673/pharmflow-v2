const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        default: ''
    },
    // Optional — Supabase manages passwords, no local password needed
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    // Supports Supabase providers: email, google, github
    provider: {
        type: String,
        enum: ['local', 'email', 'google', 'github'],
        default: 'email'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ['SuperAdmin', 'PharmacyOwner', 'Pharmacist', 'Staff', 'Cashier'],
        default: 'PharmacyOwner'
    },
    // Optional — Supabase users don't need a pharmacy on first login
    pharmacy: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pharmacy'
    },
    usedPromoCode: {
        type: String,
        default: null
    },
    plan: {
        type: String,
        enum: ['BASIC', 'PRO', 'ENTERPRISE'],
        default: 'BASIC'
    },
    subscriptionActive: {
        type: Boolean,
        default: true
    },
    subscriptionExpires: {
        type: Date,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Only hash password if it exists and was modified
// Supabase users have no local password — skip bcrypt entirely for them
userSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);

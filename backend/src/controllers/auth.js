const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new Pharmacy (SaaS Onboarding)
// @route   POST /api/auth/register-pharmacy
// @access  Public
exports.registerPharmacy = async (req, res) => {
    try {
        const {
            name,
            ownerName,
            email,
            phone,
            address,
            password,
            subscriptionPlan
        } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Account already exists with this email'
            });
        }

        // 1. Create Pharmacy (Tenant)
        const pharmacy = await Pharmacy.create({
            name,
            ownerName,
            email,
            phone,
            address,
            subscriptionPlan: subscriptionPlan || 'Basic'
        });

        // 2. Create Owner User linked to this pharmacy
        const user = await User.create({
            name: ownerName,
            email,
            password,
            role: 'PharmacyOwner',
            plan: (subscriptionPlan || 'BASIC').toUpperCase(),
            subscriptionActive: true, // New registrations are active by default for their tier
            pharmacy: pharmacy._id
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
        });
    }
};

// @desc    Register staff/pharmacist (by Owner)
// @route   POST /api/auth/register-staff
// @access  Private/PharmacyOwner
exports.registerStaff = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Account already exists with this email'
            });
        }

        // Ensure role is valid
        if (!['Pharmacist', 'Staff'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role for staff registration'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            pharmacy: req.user.pharmacy
        });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password, token } = req.body;

        // 1. Firebase Token Login
        if (token) {
            const admin = require('../config/firebaseAdmin');
            let decodedToken;
            try {
                decodedToken = await admin.auth().verifyIdToken(token);
            } catch (err) {
                return res.status(401).json({ success: false, error: 'Invalid or expired Firebase token' });
            }

            const userEmail = decodedToken.email;
            let user = await User.findOne({ email: userEmail }).populate('pharmacy');
            
            if (!user) {
                // Determine provider based on Firebase sign_in_provider
                const signInProvider = decodedToken.firebase?.sign_in_provider;
                const isGoogle = signInProvider === 'google.com';
                
                if (isGoogle) {
                    user = await User.create({
                        name: decodedToken.name || 'User',
                        email: userEmail,
                        provider: 'google',
                        role: 'PharmacyOwner'
                    });
                } else {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found. Please register your pharmacy first.'
                    });
                }
            }

            return sendTokenResponse(user, 200, res);
        }

        // 2. Legacy Email/Password Login
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password').populate('pharmacy');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('pharmacy');

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                subscriptionActive: user.subscriptionActive,
                subscriptionExpires: user.subscriptionExpires,
                pharmacy: user.pharmacy
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update pharmacy details
// @route   PUT /api/auth/pharmacy
// @access  Private/Owner
exports.updatePharmacy = async (req, res) => {
    try {
        if (req.user.role !== 'PharmacyOwner') {
            return res.status(403).json({
                success: false,
                error: 'Only pharmacy owners can update pharmacy details'
            });
        }

        const fieldsToUpdate = {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone
        };

        const pharmacy = await Pharmacy.findByIdAndUpdate(req.user.pharmacy, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: pharmacy
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                error: 'Password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'There is no user with that email'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });

            res.status(200).json({
                success: true,
                data: 'Email sent'
            });
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                error: 'Email could not be sent'
            });
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Delete account
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({
            success: true,
            message: "Account deleted"
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
            subscriptionActive: user.subscriptionActive,
            subscriptionExpires: user.subscriptionExpires,
            pharmacy: user.pharmacy
        }
    });
};

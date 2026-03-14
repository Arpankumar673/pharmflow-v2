const express = require('express');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/rateLimiter');
const admin = require("../config/firebaseAdmin");
const User = require("../models/User");
const {
    registerPharmacy,
    registerStaff,
    login,
    getMe,
    updateDetails,
    updatePassword,
    updatePharmacy,
    forgotPassword,
    resetPassword,
    deleteAccount
} = require('../controllers/auth');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route for forgot and reset password
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// TODO: [v2] Implement Multi-Factor Authentication (MFA)
// TODO: [v2] Add OAuth2 integration (Google/Microsoft)
// TODO: [v2] Migrate to passport.js for more robust auth strategies

// Firebase Google Login
router.post("/google-login", async (req, res) => {
    try {
        const { token } = req.body;

        // Verify Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name } = decodedToken;

        // Check if user exists in MongoDB
        let user = await User.findOne({ email });

        if (!user) {
            // Create user if they don't exist
            user = await User.create({
                name,
                email,
                provider: "google",
                role: 'PharmacyOwner' // Default role for new signups
            });
        }

        // Generate local JWT for PharmFlow v2
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({ token: jwtToken });
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        res.status(401).json({
            error: "Invalid Google authentication token"
        });
    }
});


router.post('/register-pharmacy', authLimiter, registerPharmacy);
router.post('/register-staff', protect, authorize('PharmacyOwner'), registerStaff);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getMe);
router.put('/profile', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/pharmacy', protect, authorize('PharmacyOwner'), updatePharmacy);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;

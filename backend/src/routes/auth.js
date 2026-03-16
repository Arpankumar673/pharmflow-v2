const express = require('express');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/rateLimiter');
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


router.post('/register-pharmacy', authLimiter, registerPharmacy);
router.post('/register-staff', protect, authorize('PharmacyOwner'), registerStaff);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getMe);
router.put('/profile', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/pharmacy', protect, authorize('PharmacyOwner'), updatePharmacy);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;

const express = require('express');
const {
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    cancelSubscription,
    getAdminAnalytics,
    applyPromo,
    activatePlan
} = require('../controllers/subscription');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public webhook route (must be before router.use(protect))
router.post('/webhook', require('../controllers/subscription').handleWebhook);

router.use(protect);

router.post('/create-order', authorize('PharmacyOwner'), createOrder);
router.post('/verify-payment', authorize('PharmacyOwner'), verifyPayment);
router.get('/status', authorize('PharmacyOwner', 'Pharmacist'), getSubscriptionStatus);
router.post('/cancel', authorize('PharmacyOwner'), cancelSubscription);
router.post('/activate', authorize('SuperAdmin'), activatePlan);
router.post('/apply-promo', authorize('PharmacyOwner'), applyPromo);

// Admin only routes
router.get('/admin/analytics', authorize('SuperAdmin'), getAdminAnalytics);

module.exports = router;

const Subscription = require('../models/Subscription');
const Pharmacy = require('../models/Pharmacy');
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');

// @desc    Create a Razorpay order for subscription
// @route   POST /api/subscription/create-order
// @access  Private/PharmacyOwner
exports.createOrder = async (req, res) => {
    try {
        const { plan, promoCode } = req.body;

        if (!plan) {
            return res.status(400).json({
                success: false,
                message: "Plan is required"
            });
        }

        const pricing = {
            Basic: 199,
            Pro: 399,
            Enterprise: 799,
            BASIC: 199,
            PRO: 399,
            ENTERPRISE: 799
        };

        const normalizedPlan = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();

        if (!pricing[normalizedPlan] && !pricing[plan]) {
            return res.status(400).json({ success: false, error: 'Invalid plan selected' });
        }

        let basePrice = pricing[normalizedPlan] || pricing[plan];
        let finalPrice = basePrice;
        let discountPercent = 0;
        let durationMonths = 1; // Default 1 month

        // Handle Promo Code
        if (promoCode) {
            const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
            
            if (!promo || !promo.active || (promo.maxUses && promo.usedCount >= promo.maxUses)) {
                return res.status(400).json({ success: false, error: 'Invalid or expired promo code' });
            }
            
            const user = await User.findById(req.user.id);
            if (user.usedPromoCode) {
                return res.status(400).json({ success: false, error: 'You have already used a promo code' });
            }

            discountPercent = promo.discountPercent;
            durationMonths = promo.durationMonths;
            finalPrice = basePrice - (basePrice * (discountPercent / 100));
        }

        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

        if (finalPrice <= 0) {
            // Free plan trigger: skip Razorpay
            await Subscription.create({
                userId: req.user.id,
                pharmacyId: req.user.pharmacy,
                plan: normalizedPlan,
                amount: basePrice, // Original plan amount
                pricePaid: 0,
                status: 'active',
                paymentStatus: 'paid',
                startDate,
                expiryDate,
                currentPeriodEnd: expiryDate,
                promoCodeUsed: promoCode ? promoCode.toUpperCase() : null
            });

            if (promoCode) {
                await PromoCode.findOneAndUpdate(
                    { code: promoCode.toUpperCase() },
                    { $inc: { usedCount: 1 } }
                );
                await User.findByIdAndUpdate(req.user.id, {
                    usedPromoCode: promoCode.toUpperCase(),
                    plan: normalizedPlan,
                    subscriptionActive: true,
                    subscriptionExpires: expiryDate
                });
            } else {
                await User.findByIdAndUpdate(req.user.id, {
                    plan: normalizedPlan,
                    subscriptionActive: true,
                    subscriptionExpires: expiryDate
                });
            }

            await Pharmacy.findByIdAndUpdate(req.user.pharmacy, {
                subscriptionPlan: normalizedPlan,
                subscriptionStatus: 'Active',
                status: 'Active'
            });

            return res.status(200).json({
                success: true,
                message: 'Subscription activated directly',
                noPaymentRequired: true
            });
        }

        const amountInPaisa = Math.round(finalPrice * 100);

        const options = {
            amount: amountInPaisa,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Create a pending subscription record linked to user & pharmacy
        await Subscription.create({
            userId: req.user.id,
            pharmacyId: req.user.pharmacy,
            razorpayOrderId: order.id,
            plan: normalizedPlan,
            amount: basePrice,
            pricePaid: finalPrice,
            status: 'pending',
            startDate,
            expiryDate, // We can store this assuming 1 month or durationMonths if they pay
            currentPeriodEnd: expiryDate,
            promoCodeUsed: promoCode ? promoCode.toUpperCase() : null
        });

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/subscription/verify-payment
// @access  Private/PharmacyOwner
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified
            const subscription = await Subscription.findOne({ razorpayOrderId: razorpay_order_id });

            if (!subscription) {
                return res.status(404).json({ success: false, error: 'Subscription record not found' });
            }

            subscription.status = 'active';
            subscription.paymentStatus = 'paid';
            subscription.razorpayPaymentId = razorpay_payment_id;
            // expiryDate was saved during createOrder, sync currentPeriodEnd
            subscription.currentPeriodEnd = subscription.expiryDate;
            await subscription.save();

            // Handle Promo Code marking + User state
            if (subscription.promoCodeUsed) {
                await PromoCode.findOneAndUpdate(
                    { code: subscription.promoCodeUsed },
                    { $inc: { usedCount: 1 } }
                );
            }
            
            await User.findByIdAndUpdate(subscription.userId, {
                usedPromoCode: subscription.promoCodeUsed,
                plan: subscription.plan,
                subscriptionActive: true,
                subscriptionExpires: subscription.expiryDate
            });

            // Update Pharmacy plan
            await Pharmacy.findByIdAndUpdate(subscription.pharmacyId, {
                subscriptionPlan: subscription.plan,
                subscriptionStatus: 'Active',
                status: 'Active'
            });

            res.status(200).json({
                success: true,
                message: "Payment verified successfully"
            });
        } else {
            res.status(400).json({
                success: false,
                error: "Invalid signature"
            });
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get subscription status
// @route   GET /api/subscription/status
// @access  Private/PharmacyOwner
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            pharmacyId: req.user.pharmacy,
            status: 'active'
        }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.status(200).json({
                success: true,
                data: { plan: 'None', status: 'inactive' }
            });
        }

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private/PharmacyOwner
exports.cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            pharmacyId: req.user.pharmacy,
            status: 'active'
        });

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'No active subscription found' });
        }

        subscription.status = 'cancelled';
        await subscription.save();

        // Optional: Keep plan until period ends, but for simplicity we cancel now
        await Pharmacy.findByIdAndUpdate(req.user.pharmacy, {
            status: 'Suspended'
        });

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get Admin Subscription Analytics
// @route   GET /api/subscription/admin/analytics
// @access  Private/SuperAdmin
exports.getAdminAnalytics = async (req, res) => {
    try {
        const totalPharmacies = await Pharmacy.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

        const subscriptions = await Subscription.find({ status: 'active' });
        const monthlyRevenue = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

        const planDistribution = await Subscription.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$plan', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalPharmacies,
                activeSubscriptions,
                monthlyRevenue,
                planDistribution
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Handle Razorpay Webhooks
// @route   POST /api/subscription/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEB_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    try {
        if (event === 'payment.captured' || event === 'order.paid') {
            const orderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
            const subscription = await Subscription.findOne({ razorpayOrderId: orderId });
            if (subscription) {
                subscription.status = 'active';
                subscription.paymentStatus = 'paid';
                subscription.razorpayPaymentId = payload.payment?.entity?.id;
                await subscription.save();
                await Pharmacy.findByIdAndUpdate(subscription.pharmacyId, {
                    subscriptionPlan: subscription.plan,
                    status: 'Active'
                });
            }
        } else if (event === 'payment.failed') {
            const orderId = payload.payment?.entity?.order_id;
            const subscription = await Subscription.findOne({ razorpayOrderId: orderId });
            if (subscription) {
                subscription.status = 'failed';
                subscription.paymentStatus = 'failed';
                await subscription.save();
            }
        } else if (event === 'subscription.cancelled') {
            const subId = payload.subscription?.entity?.id;
            const subscription = await Subscription.findOne({ razorpaySubscriptionId: subId });
            if (subscription) {
                subscription.status = 'cancelled';
                await subscription.save();
                await Pharmacy.findByIdAndUpdate(subscription.pharmacyId, { status: 'Suspended' });
            }
        }
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).send('Webhook Processing Error');
    }
};
const PromoCode = require('../models/PromoCode');
const User = require('../models/User');

// @desc    Activate a plan immediately (for Basic or internal use)
// @route   POST /api/subscription/activate
// @access  Private/PharmacyOwner
exports.activatePlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const validPlans = ['BASIC', 'PRO', 'ENTERPRISE'];

        if (!plan || !validPlans.includes(plan.toUpperCase())) {
            return res.status(400).json({ success: false, error: 'Invalid plan protocol' });
        }

        const normalizedPlan = plan.toUpperCase();
        const duration = 30; // Default 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        // Update Pharmacy
        await Pharmacy.findByIdAndUpdate(req.user.pharmacy, {
            subscriptionPlan: normalizedPlan,
            subscriptionStatus: 'Active',
            status: 'Active'
        });

        // Update User
        const user = await User.findById(req.user.id);
        user.plan = normalizedPlan;
        user.subscriptionActive = true;
        user.subscriptionExpires = expiresAt;
        await user.save();

        // Create or update subscription record
        await Subscription.findOneAndUpdate(
            { pharmacyId: req.user.pharmacy, status: 'active' },
            { 
                plan: normalizedPlan,
                amount: 0,
                paymentStatus: 'paid',
                currentPeriodEnd: expiresAt,
                razorpayOrderId: 'ACTIVATE_' + Date.now()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: `${normalizedPlan} Protocol Enabled`,
            user
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Apply a promo code to subscription
// @route   POST /api/subscription/apply-promo
// @access  Private/PharmacyOwner
exports.applyPromo = async (req, res) => {
    try {
        console.log("Promo request:", req.body);
        const { planPrice } = req.body;
        const code = req.body.code?.trim().toUpperCase();
        
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ valid: false, message: 'Promo code is required' });
        }

        // 1. Check if user already used a promo code
        const user = await User.findById(userId);
        if (user.usedPromoCode) {
            return res.status(400).json({ valid: false, message: 'You have already used a promo code' });
        }

        // 2. Check if code exists
        const promo = await PromoCode.findOne({ code: code, active: true });
        if (!promo) {
            return res.status(400).json({ valid: false, message: 'Invalid or inactive promo code' });
        }

        // 3. Check if code expired
        if (promo.expiresAt && promo.expiresAt < new Date()) {
            return res.status(400).json({ valid: false, message: 'Promo code expired' });
        }

        // 4. Check max usage
        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ valid: false, message: 'Promo usage limit reached' });
        }

        const basePrice = planPrice || 0;
        const discountAmount = (basePrice * promo.discountPercent) / 100;
        const finalPrice = basePrice - discountAmount;

        res.status(200).json({
            valid: true,
            discountPercent: promo.discountPercent,
            durationMonths: promo.durationMonths,
            finalPrice,
            message: `Promo applied: ${promo.discountPercent}% off for ${promo.durationMonths} months!`
        });

    } catch (err) {
        console.error('Apply Promo Error:', err);
        res.status(400).json({
            valid: false,
            message: err.message
        });
    }
};

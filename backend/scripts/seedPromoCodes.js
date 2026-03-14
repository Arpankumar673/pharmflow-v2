const mongoose = require('mongoose');
const PromoCode = require('../src/models/PromoCode');
require('dotenv').config();

const codes = [
    { code: 'PHARMFREE3', discountPercent: 100, durationMonths: 3, type: 'free', active: true, maxUses: 100 },
    { code: 'PHARM50', discountPercent: 50, durationMonths: 3, type: 'percentage', active: true, maxUses: 500 },
    { code: 'PHARM30', discountPercent: 30, durationMonths: 3, type: 'percentage', active: true, maxUses: null },
    { code: 'START20', discountPercent: 20, durationMonths: 2, type: 'percentage', active: true, maxUses: null },
    { code: 'EARLY100', discountPercent: 100, durationMonths: 1, type: 'free', active: true, maxUses: 50 }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        for (const c of codes) {
            await PromoCode.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
        }

        console.log('Promo codes seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding promo codes:', err);
        process.exit(1);
    }
};

seed();

const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const medicines = require('./routes/medicines');
const suppliers = require('./routes/suppliers');
const sales = require('./routes/sales');
const dashboard = require('./routes/dashboard');
const reports = require('./routes/reports');
const subscription = require('./routes/subscription');
const platform = require('./routes/platform');
const prescription = require('./routes/prescription');
const supplyChain = require('./routes/supplyChain');
const network = require('./routes/network');
const analytics = require('./routes/analytics');
const purchaseOrders = require('./routes/purchaseOrders');
const pharmacy = require('./routes/pharmacy');
const users = require('./routes/users');
const staff = require('./routes/staff');
const settings = require('./routes/settings');
const system = require('./routes/system');

const app = express();

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Enable CORS
const allowedOrigins = [
    'http://localhost:5173',
    'https://pharmflow-v2.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Express Session
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Set security headers
app.use(helmet());

// PharmFlow v2 request logging
app.use((req, res, next) => {
    console.log(`PharmFlow v2 API request: ${req.method} ${req.url}`);
    next();
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api', apiLimiter);
app.use('/api/auth', auth);
app.use('/api/inventory', medicines);
app.use('/api/suppliers', suppliers);
app.use('/api/billing', sales);
app.use('/api/dashboard', dashboard);
app.use('/api/reports', reports);
app.use('/api/subscription', subscription);
app.use('/api/platform', platform);
app.use('/api/prescription', prescription);
app.use('/api/supply-chain', supplyChain);
app.use('/api/network', network);
app.use('/api/analytics', analytics);
app.use('/api/purchase-orders', purchaseOrders);
app.use('/api/pharmacy', pharmacy);
app.use('/api/users', users);
app.use('/api/staff', staff);
app.use('/api/settings', settings);
app.use('/api/system', system);

// API v2 Routes (Versioned)
app.use('/api/v2/auth', auth);
app.use('/api/v2/inventory', medicines);
app.use('/api/v2/billing', sales);

// TODO: Implement more versioned v2 specific logic here in the future


// Basic route
app.get('/', (req, res) => {
    res.send('PharmFlow v2 API running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

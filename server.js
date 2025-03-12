require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Mock database
const users = [
    { id: 2, name: 'Michael', mobile: '+447123456789' },
    { id: 3, name: 'Rawdeep', mobile: '+447987654321' },
    { id: 4, name: 'Nathaniel', mobile: '+447654321098' },
    { id: 5, name: 'Faye', mobile: '+447321098765' }
];

// OTP storage with expiration (5 minutes)
const otpStorage = [];
const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

// JWT token generation
const generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '160s' });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ status: 'error', message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// Mobile validation
const isValidMobileNumber = (mobile) => {
    const regex = /^\+447\d{9}$/;
    return regex.test(mobile);
};

// OTP generation (fixed typo)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// API endpoints
app.post('/login', (req, res) => {
    const { mobile } = req.body;

    if (!isValidMobileNumber(mobile)) {
        return res.status(400).json({ status: 'error', message: 'Invalid mobile format' });
    }

    const user = users.find(u => u.mobile === mobile);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const otp = generateOTP();
    otpStorage.push({ mobile, otp, createdAt: Date.now() });
    console.log(`OTP for ${mobile}: ${otp}`); // Simulate SMS

    res.json({ status: 'success', message: 'OTP sent' });
});

app.post('/verify', (req, res) => {
    const { mobile, otp } = req.body;
    const storedEntry = otpStorage.find(entry => 
        entry.mobile === mobile && 
        Date.now() - entry.createdAt < OTP_EXPIRATION_MS
    );

    if (!storedEntry || storedEntry.otp !== otp) {
        return res.status(401).json({ status: 'error', message: 'Invalid/expired OTP' });
    }

    otpStorage.splice(otpStorage.indexOf(storedEntry), 1); // Remove OTP

    const user = users.find(u => u.mobile === mobile);
    const token = generateAuthToken(user.id);
    res.json({ status: 'success', token });
});

app.get('/protected', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    res.json({ status: 'success', user });
});

module.exports = app;

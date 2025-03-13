require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Mock users database
const users = [
    { id: 2, name: 'Michael', mobile: '+447123456789' },
    { id: 3, name: 'Rawdeep', mobile: '+447987654321' },
    { id: 4, name: 'Nathaniel', mobile: '+447654321098' },
    { id: 5, name: 'Faye', mobile: '+447321098765' }
];

const orgStore = []; // Existing OTP storage

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

// Existing endpoints
app.post('/login', (req, res) => {
    // Existing login implementation
});

app.post('/verify', (req, res) => {
    // Existing verify implementation
});

app.get('/protected', authenticateToken, (req, res) => {
    // Existing protected endpoint
});

const addresses = []; // Temporary storage

app.get('/addresses', authenticateToken, (req, res) => {
    const userAddresses = addresses.filter(addr => addr.userId === req.user.id);
    res.json({ status: 'success', data: userAddresses });
});

app.post('/addresses', authenticateToken, (req, res) => {
    const newAddress = {
        id: addresses.length + 1,
        userId: req.user.id,
        ...req.body
    };
    addresses.push(newAddress);
    res.json({ status: 'success', data: newAddress });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

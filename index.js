const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection config
const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    connectTimeout: 10000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Get or create database pool
function getDb() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}

// Initialize tables (run once)
async function initializeTables() {
    const db = getDb();
    try {
        await db.execute(`
      CREATE TABLE IF NOT EXISTS koduser (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(50) UNIQUE NOT NULL,
        uname VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role ENUM('customer') DEFAULT 'customer',
        balance DECIMAL(15,2) DEFAULT 100000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS UserToken (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (username) REFERENCES koduser(uname) ON DELETE CASCADE
      )
    `);

        console.log('✅ Database tables ready');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
    }
}

// JWT verification middleware
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const db = getDb();
        const [tokenRows] = await db.execute(
            'SELECT * FROM UserToken WHERE token = ? AND is_active = TRUE AND expires_at > NOW()',
            [token]
        );

        if (tokenRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const db = getDb();
        await db.execute('SELECT 1');
        res.json({
            success: true,
            message: 'KodBank API is running!',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'KodBank API is running!',
            timestamp: new Date().toISOString(),
            database: 'disconnected'
        });
    }
});

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { uid, uname, password, email, phone } = req.body;

        if (!uid || !uname || !password || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const db = getDb();
        await initializeTables();

        const [existingUsers] = await db.execute(
            'SELECT * FROM koduser WHERE uid = ? OR uname = ? OR email = ?',
            [uid, uname, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this UID, username, or email already exists'
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.execute(
            'INSERT INTO koduser (uid, uname, password, email, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uid, uname, hashedPassword, email, phone, 'customer', 100000.00]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully! Please login to continue.',
            data: { uid, uname, email, phone, role: 'customer', balance: 100000.00 }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { uname, password } = req.body;

        if (!uname || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const db = getDb();
        const [users] = await db.execute('SELECT * FROM koduser WHERE uname = ?', [uname]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const tokenPayload = {
            sub: user.uname,
            role: user.role,
            uid: user.uid,
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await db.execute(
            'INSERT INTO UserToken (username, token, expires_at) VALUES (?, ?, ?)',
            [user.uname, token, expiresAt]
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                user: { uid: user.uid, uname: user.uname, email: user.email, role: user.role }
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// Check Balance
app.get('/api/balance', verifyToken, async (req, res) => {
    try {
        const username = req.user.sub;
        const db = getDb();
        const [users] = await db.execute('SELECT balance FROM koduser WHERE uname = ?', [username]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const balance = parseFloat(users[0].balance);
        res.json({
            success: true,
            message: 'Balance retrieved successfully',
            data: {
                balance,
                username,
                formattedBalance: `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
        });
    } catch (error) {
        console.error('Balance check error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error while checking balance'
        });
    }
});

// Logout
app.post('/api/logout', verifyToken, async (req, res) => {
    try {
        const token = req.cookies.authToken;
        const db = getDb();
        await db.execute('UPDATE UserToken SET is_active = FALSE WHERE token = ?', [token]);
        res.clearCookie('authToken');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).json({ success: false, message: 'Error during logout' });
    }
});

// Verify authentication
app.get('/api/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: { username: req.user.sub, role: req.user.role, uid: req.user.uid }
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

module.exports = app;

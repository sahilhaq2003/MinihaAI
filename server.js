/**
 * BACKEND SERVER CODE (Node.js / Express / SQLite)
 * 
 * Dependencies: npm install express cors body-parser google-auth-library sqlite3 dotenv uuid bcryptjs
 * Run: node server.js
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// --- SQLITE DATABASE CONNECTION ---
const dbPath = path.resolve(__dirname, 'miniha.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// --- INITIALIZE TABLES ---
db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    picture TEXT,
    provider TEXT,
    is_premium INTEGER DEFAULT 0,
    google_id TEXT,
    created_at TEXT
  )`);

  // Transactions Table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    amount TEXT,
    status TEXT,
    date TEXT,
    invoice_id TEXT,
    plan_type TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

const client = new OAuth2Client(CLIENT_ID);

// Allow requests from any origin for development
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Helper to wrap db.get in Promise
const dbGet = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Helper to wrap db.run in Promise
const dbRun = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// Helper to wrap db.all in Promise
const dbAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// --- GOOGLE AUTH ---
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    // SPECIAL HANDLING FOR DEMO/TESTING
    if (token === 'dummy_token_for_simulation') {
        const demoEmail = 'demo_user@example.com';
        let user = await dbGet("SELECT * FROM users WHERE email = ?", [demoEmail]);
        
        if (!user) {
            const userId = uuidv4();
            await dbRun(`INSERT INTO users (id, email, name, picture, provider, google_id, is_premium, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [userId, demoEmail, 'Demo Google User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=google_demo', 'google', 'dummy_google_id_12345', 0, new Date().toISOString()]
            );
            user = await dbGet("SELECT * FROM users WHERE id = ?", [userId]);
        }
        
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.picture,
                isPremium: !!user.is_premium
            }
        });
    }

    // REAL GOOGLE VERIFICATION
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const googleUserId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];

    // Check if user exists
    let user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
        // Create new user
        const userId = uuidv4();
        await dbRun(`INSERT INTO users (id, email, name, picture, provider, google_id, is_premium, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, email, name, picture, 'google', googleUserId, 0, new Date().toISOString()]
        );
        user = await dbGet("SELECT * FROM users WHERE id = ?", [userId]);
    } else if (user.provider !== 'google') {
        // Update existing user with Google ID
        await dbRun("UPDATE users SET google_id = ?, provider = ?, picture = ? WHERE id = ?", [googleUserId, 'google', picture, user.id]);
        user = await dbGet("SELECT * FROM users WHERE id = ?", [user.id]);
    }

    res.status(200).json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.picture,
            isPremium: !!user.is_premium
        }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Invalid Token' });
  }
});

// --- EMAIL SIGNUP ---
app.post('/api/auth/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const userId = uuidv4();
        const picture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
        const name = email.split('@')[0];

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        await dbRun(`INSERT INTO users (id, email, password, name, picture, provider, is_premium, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, email, hashedPassword, name, picture, 'email', 0, new Date().toISOString()]
        );

        const newUser = await dbGet("SELECT * FROM users WHERE id = ?", [userId]);

        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.picture,
                isPremium: !!newUser.is_premium
            }
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server error during signup" });
    }
});

// --- EMAIL LOGIN ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.provider === 'google') {
            return res.status(400).json({ success: false, message: 'Please login with Google' });
        }

        // Check password using bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
             return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.picture,
                isPremium: !!user.is_premium
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// --- BILLING HISTORY ENDPOINT ---
app.get('/api/user/:userId/transactions', async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await dbAll("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC", [userId]);
        
        // Format for frontend
        const formatted = transactions.map(t => ({
            id: t.id,
            date: new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            amount: t.amount,
            status: t.status,
            invoice: t.invoice_id
        }));

        res.status(200).json({ success: true, transactions: formatted });
    } catch (error) {
        console.error("Tx Error:", error);
        res.status(500).json({ success: false, message: "Error fetching transactions" });
    }
});

// --- SIMULATE PAYMENT (For testing) ---
app.post('/api/payment/create', async (req, res) => {
    const { userId, amount } = req.body;
    try {
        // Update User to Premium
        await dbRun("UPDATE users SET is_premium = 1 WHERE id = ?", [userId]);
        
        // Record Transaction
        const txId = uuidv4();
        const invoiceId = '#INV-' + Math.floor(Math.random() * 1000000);
        
        await dbRun(`INSERT INTO transactions (id, user_id, amount, status, date, invoice_id, plan_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [txId, userId, amount, 'Paid', new Date().toISOString(), invoiceId, 'Pro Plan']
        );

        const newTx = await dbGet("SELECT * FROM transactions WHERE id = ?", [txId]);

        res.status(200).json({ success: true, transaction: newTx });
    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ success: false, message: "Payment failed" });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
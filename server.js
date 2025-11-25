/**
 * BACKEND SERVER CODE (Node.js / Express)
 * 
 * Dependencies: npm install express cors body-parser google-auth-library mongoose
 * Run: node server.js
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// --- MONGODB CONNECTION ---
// Note: 'Sahil@2003' contains special char '@', so it is encoded as 'Sahil%402003'
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sahilhaq2003_db_user:Sahil%402003@cluster0.05nysek.mongodb.net/miniha_db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- USER MODEL ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Stored as plain text for this demo (Use bcrypt in production!)
  name: String,
  picture: String,
  provider: { type: String, default: 'email' }, // 'email' or 'google'
  isPremium: { type: Boolean, default: false },
  googleId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- TRANSACTION MODEL (For Payments) ---
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: String, required: true }, // e.g., "$19.00"
  status: { type: String, default: 'Paid' }, // Paid, Pending, Failed
  date: { type: Date, default: Date.now },
  invoiceId: { type: String },
  planType: { type: String, default: 'Pro Plan' }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const client = new OAuth2Client(CLIENT_ID);

// Allow requests from any origin for development
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// --- GOOGLE AUTH ---
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    // SPECIAL HANDLING FOR DEMO/TESTING
    // If we receive the simulation token from the frontend, we bypass Google verification
    // and create/return a MongoDB user directly.
    if (token === 'dummy_token_for_simulation') {
        const demoEmail = 'demo_user@example.com';
        let user = await User.findOne({ email: demoEmail });
        
        if (!user) {
            user = await User.create({
                email: demoEmail,
                name: 'Demo Google User',
                picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=google_demo`,
                provider: 'google',
                googleId: 'dummy_google_id_12345',
                isPremium: false
            });
        }
        
        return res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.picture,
                isPremium: user.isPremium
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

    // Check if user exists in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
        // Create new user
        user = await User.create({
            email,
            name,
            picture,
            provider: 'google',
            googleId: googleUserId,
            isPremium: false
        });
    } else if (user.provider !== 'google') {
        // Update existing user with Google ID if they previously signed up with email
        user.googleId = googleUserId;
        user.provider = 'google'; 
        user.picture = picture; // Update avatar
        await user.save();
    }

    res.status(200).json({
        success: true,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.picture,
            isPremium: user.isPremium
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create User in MongoDB
        const newUser = await User.create({
            email,
            password, // Note: In a real app, use bcrypt.hash(password, 10) here!
            name: email.split('@')[0],
            provider: 'email',
            picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        });

        res.status(201).json({
            success: true,
            user: {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.picture,
                isPremium: newUser.isPremium
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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.provider === 'google') {
            return res.status(400).json({ success: false, message: 'Please login with Google' });
        }

        // Check password (In production use bcrypt.compare)
        if (user.password !== password) {
             return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.picture,
                isPremium: user.isPremium
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
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        
        // Format for frontend
        const formatted = transactions.map(t => ({
            id: t._id,
            date: t.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            amount: t.amount,
            status: t.status,
            invoice: t.invoiceId
        }));

        res.status(200).json({ success: true, transactions: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching transactions" });
    }
});

// --- SIMULATE PAYMENT (For testing) ---
app.post('/api/payment/create', async (req, res) => {
    const { userId, amount } = req.body;
    try {
        // 1. In real life, you would call Stripe/PayPal API here
        // 2. Update User to Premium
        await User.findByIdAndUpdate(userId, { isPremium: true });
        
        // 3. Record Transaction
        const newTx = await Transaction.create({
            userId,
            amount,
            status: 'Paid',
            invoiceId: '#INV-' + Math.floor(Math.random() * 1000000),
            planType: 'Pro Plan'
        });

        res.status(200).json({ success: true, transaction: newTx });
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment failed" });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
/**
 * BACKEND SERVER CODE (Node.js / Express / MongoDB)
 * 
 * Dependencies: npm install express cors body-parser mongoose dotenv uuid bcryptjs
 * Run: node server.cjs
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

// --- MONGODB CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahilhaq2003:Sahil%402003Haq@cluster0.buir1zc.mongodb.net/minihaai?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- MONGOOSE SCHEMAS ---
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  picture: { type: String },
  provider: { type: String, default: 'email' },
  is_premium: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  amount: { type: String },
  status: { type: String },
  date: { type: Date, default: Date.now },
  invoice_id: { type: String },
  plan_type: { type: String }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  'https://minihaai.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// --- Health Check ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MinihaAI Backend API is running!',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// --- EMAIL SIGNUP ---
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  console.log('📝 Signup attempt for:', email);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      id: uuidv4(),
      email,
      password: hashedPassword,
      name: email.split('@')[0],
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      provider: 'email',
      is_premium: false,
      created_at: new Date()
    });

    const savedUser = await user.save();
    console.log('✅ User saved to MongoDB:', savedUser.email);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.picture,
        isPremium: user.is_premium
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
        isPremium: user.is_premium
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// --- BILLING HISTORY ---
app.get('/api/user/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ user_id: userId }).sort({ date: -1 });
    
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

// --- PAYMENT ---
app.post('/api/payment/create', async (req, res) => {
  const { userId, amount } = req.body;
  try {
    // Update User to Premium
    await User.findOneAndUpdate({ id: userId }, { is_premium: true });
    
    // Record Transaction
    const transaction = new Transaction({
      id: uuidv4(),
      user_id: userId,
      amount,
      status: 'Paid',
      date: new Date(),
      invoice_id: '#INV-' + Math.floor(Math.random() * 1000000),
      plan_type: 'Pro Plan'
    });
    
    await transaction.save();

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
});

// --- GET USER BY ID ---
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.picture,
        isPremium: user.is_premium
      }
    });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

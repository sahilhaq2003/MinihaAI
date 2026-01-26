/**
 * BACKEND SERVER CODE (Node.js / Express / Sequelize / MySQL)
 * 
 * Dependencies: npm install express cors body-parser sequelize mysql2 dotenv uuid bcryptjs
 * Run: node server.js
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// --- DATABASE CONNECTION (AWS RDS / MySQL) ---
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'minihaai';

if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
  console.error('❌ Database credentials missing in .env!');
  console.error('   Please set DB_HOST, DB_USER, DB_PASSWORD.');
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Often needed for AWS RDS if self-signed certs or simple setup
    }
  }
});

// Test Database Connection
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to AWS RDS (MySQL) successfully.');

    // Sync models (create tables if not exist)
    // In production, use migrations instead of sync({ alter: true })
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.log('   Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
}

connectDB();

// --- DATA MODELS ---

const User = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  picture: { type: DataTypes.STRING(1000) },
  mobile_number: { type: DataTypes.STRING },
  provider: { type: DataTypes.STRING, defaultValue: 'email' },
  is_premium: { type: DataTypes.BOOLEAN, defaultValue: false },
  premium_expires_at: { type: DataTypes.DATE },
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verification_token: { type: DataTypes.STRING },
  verification_token_expires: { type: DataTypes.DATE },
  reset_password_token: { type: DataTypes.STRING },
  reset_password_expires: { type: DataTypes.DATE },
  otp_code: { type: DataTypes.STRING },
  otp_expires: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'users'
});

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.STRING, primaryKey: true },
  user_id: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  invoice_id: { type: DataTypes.STRING },
  plan_type: { type: DataTypes.STRING },
  payment_method: { type: DataTypes.STRING, defaultValue: 'simulation' }
}, {
  timestamps: false,
  tableName: 'transactions'
});

const PaymentRequest = sequelize.define('PaymentRequest', {
  id: { type: DataTypes.STRING, primaryKey: true },
  user_id: { type: DataTypes.STRING, allowNull: false },
  user_email: { type: DataTypes.STRING, allowNull: false },
  user_name: { type: DataTypes.STRING },
  amount: { type: DataTypes.STRING, allowNull: false },
  payment_id: { type: DataTypes.STRING, allowNull: false },
  payment_receipt: { type: DataTypes.TEXT },
  payment_method: { type: DataTypes.STRING, defaultValue: 'manual' },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  admin_notes: { type: DataTypes.TEXT },
  submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  reviewed_at: { type: DataTypes.DATE },
  reviewed_by: { type: DataTypes.STRING }
}, {
  timestamps: false,
  tableName: 'payment_requests'
});

const IPTracking = sequelize.define('IPTracking', {
  ip_address: { type: DataTypes.STRING, primaryKey: true },
  account_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_account_created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'ip_tracking'
});

// Helper function to check and update expired premium status
const checkAndUpdatePremiumExpiration = async (user) => {
  if (!user || !user.is_premium) {
    return user;
  }

  if (user.premium_expires_at && new Date() > new Date(user.premium_expires_at)) {
    user.is_premium = false;
    user.premium_expires_at = null;
    await user.save();
    console.log(`⏰ Premium expired for user: ${user.email} (${user.id})`);
  }

  return user;
};

// --- EMAIL SERVICE SETUP ---
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email not configured.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createEmailTransporter();
    const info = await transporter.sendMail({
      from: `"MinihaAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// --- CORS ---
const allowedOrigins = [
  'https://minihaai.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
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

app.set('trust proxy', true);
app.use(bodyParser.json());

// --- ROUTES ---

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MinihaAI Backend API is running (AWS RDS Edition)!',
    database: 'MySQL (AWS RDS)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = req.headers['x-real-ip'];
  if (realIP) return realIP;
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  const clientIP = getClientIP(req);

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (clientIP !== 'unknown') {
      let ipTracking = await IPTracking.findByPk(clientIP);

      if (!ipTracking) {
        ipTracking = IPTracking.build({
          ip_address: clientIP,
          account_count: 0,
          last_account_created: new Date()
        });
      }

      if (ipTracking.account_count >= 2) {
        return res.status(429).json({
          success: false,
          message: 'Account creation limit reached.'
        });
      }
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    const user = User.build({
      id: uuidv4(),
      email,
      password: hashedPassword,
      name: email.split('@')[0],
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider: 'email',
      is_premium: false,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      created_at: new Date()
    });

    const savedUser = await user.save();

    if (clientIP !== 'unknown') {
      try {
        let ipTracking = await IPTracking.findByPk(clientIP);
        if (ipTracking) {
          ipTracking.account_count += 1;
          ipTracking.last_account_created = new Date();
          await ipTracking.save();
        } else {
          await IPTracking.create({
            ip_address: clientIP,
            account_count: 1,
            last_account_created: new Date()
          });
        }
      } catch (ipError) {
        console.error('IP tracking error', ipError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email.',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        avatar: savedUser.picture,
        isPremium: savedUser.is_premium
      }
    });

    // Verification email logic (omitted for brevity, same as before)

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    await checkAndUpdatePremiumExpiration(user);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.picture,
        isPremium: user.is_premium,
        emailVerified: user.email_verified
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// VERIFY EMAIL
app.get('/api/auth/verify-email', async (req, res) => {
  const { token, email } = req.query;
  const { Op } = require('sequelize');

  try {
    const user = await User.findOne({
      where: {
        email,
        verification_token: token,
        verification_token_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

// GET TRANSACTIONS
app.get('/api/user/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [['date', 'DESC']]
    });

    const formatted = transactions.map(t => ({
      id: t.id,
      date: new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      amount: t.amount,
      status: t.status,
      invoice: t.invoice_id
    }));

    res.status(200).json({ success: true, transactions: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transactions" });
  }
});

// CREATE PAYMENT (Used by automatic payment flow)
app.post('/api/payment/create', async (req, res) => {
  const { userId, amount } = req.body;
  try {
    await User.update({ is_premium: true }, { where: { id: userId } });

    const transaction = await Transaction.create({
      id: uuidv4(),
      user_id: userId,
      amount,
      status: 'Paid',
      date: new Date(),
      invoice_id: '#INV-' + Math.floor(Math.random() * 1000000),
      plan_type: 'Pro Plan'
    });

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Payment failed" });
  }
});

// SUBMIT MANUAL PAYMENT REQUEST
app.post('/api/payment/request', async (req, res) => {
  const { userId, userEmail, userName, amount, paymentId, paymentReceipt } = req.body;

  try {
    const existingRequest = await PaymentRequest.findOne({
      where: { user_id: userId, status: 'pending' }
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: "You already have a pending request." });
    }

    const request = await PaymentRequest.create({
      id: uuidv4(),
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      amount,
      payment_id: paymentId,
      payment_receipt: paymentReceipt,
      status: 'pending',
      submitted_at: new Date()
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error("Payment Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit payment request" });
  }
});

// CHECK PAYMENT STATUS
app.get('/api/payment/status/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    const pendingRequest = await PaymentRequest.findOne({
      where: { user_id: userId, status: 'pending' }
    });

    res.json({
      success: true,
      isPremium: user?.is_premium || false,
      hasPending: !!pendingRequest,
      paymentRequest: pendingRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking status" });
  }
});

// --- AI ROUTES ---

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

// Helper function to retry API calls with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error
      if (error.status === 429 || (error.errorDetails && error.errorDetails.some(e => e['@type']?.includes('RetryInfo')))) {
        const retryDelay = error.errorDetails?.find(e => e.retryDelay)?.retryDelay;
        let waitTime = initialDelay * Math.pow(2, i);

        // Parse retry delay if provided (e.g., "21s")
        if (retryDelay) {
          const seconds = parseInt(retryDelay);
          if (!isNaN(seconds)) {
            waitTime = seconds * 1000;
          }
        }

        if (i < maxRetries - 1) {
          console.log(`⏳ Rate limit hit. Retrying in ${waitTime / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      throw error;
    }
  }
}

app.post('/api/ai/humanize', async (req, res) => {
  const { text, tone, vocabulary, intensity } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("❌ GEMINI_API_KEY is missing or invalid in .env");
    return res.status(500).json({ success: false, message: "Server misconfiguration: Missing API Key" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct prompt based on parameters
    let prompt = `Rewrite the following text to make it sound more human, natural, and less like AI generated content. 
    Tone: ${tone || 'Natural'}
    Vocabulary Level: ${vocabulary || 'Standard'}
    Humanization Intensity: ${intensity || 50}% (100% means completely rewritten/rephrased)
    
    Original Text:
    "${text}"
    
    Return ONLY the rewritten text, nothing else.`;

    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });

    const response = await result.response;
    const rewrittenText = response.text();

    res.json({ success: true, text: rewrittenText });
  } catch (error) {
    console.error("AI Humanize Error:", error);

    // Provide user-friendly error messages
    if (error.status === 429 || (error.errorDetails && error.errorDetails.some(e => e['@type']?.includes('RetryInfo')))) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Please wait a moment and try again.",
        error: "RATE_LIMIT"
      });
    }

    res.status(500).json({ success: false, message: "AI processing failed", error: error.message });
  }
});

app.post('/api/ai/detect', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze the following text and determine if it appears to be written by AI or a Human.
    Text: "${text}"
    
    Provide a JSON response with the following format:
    {
      "score": <number between 0 and 100, where 100 is definitely AI>,
      "label": "<"AI Generated" | "Mixed" | "Human Written">",
      "analysis": "<short explanation>"
    }
    Return ONLY the JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    res.json({ success: true, ...analysis });
  } catch (error) {
    // Fallback simulation if API fails or parsing fails
    console.error("AI Detect Error (using fallback):", error);
    res.json({
      success: true,
      score: 10,
      label: "Human Written",
      analysis: "Could not reach AI service, defaulting to human/low probability."
    });
  }
});

app.post('/api/ai/evaluate', async (req, res) => {
  const { original, rewritten } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Compare the original text and the rewritten text. Evaluate the quality of the rewrite.
    Original: "${original}"
    Rewritten: "${rewritten}"
    
    Return a JSON response:
    {
      "humanScore": <0-100 rating of naturalness>,
      "meaningPreserved": <boolean>,
      "feedback": "<short sentence>"
    }
    Return ONLY the JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, '').trim();
    const evaluation = JSON.parse(jsonStr);

    res.json({ success: true, ...evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Evaluation failed" });
  }
});

// --- USER PHOTO UPDATE ---
app.put('/api/user/:userId/photo', async (req, res) => {
  const { userId } = req.params;
  const { photo } = req.body; // Expecting base64 string

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.picture = photo;
    await user.save();

    res.json({
      success: true,
      message: 'Photo updated',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.picture,
        isPremium: user.is_premium
      }
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    res.status(500).json({ success: false, message: "Failed to update photo" });
  }
});

// --- ADMIN ROUTES ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.get('/api/admin/payments', async (req, res) => {
  const { adminPassword } = req.query;
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin password' });
  }

  try {
    const pending = await PaymentRequest.findAll({ where: { status: 'pending' }, order: [['submitted_at', 'DESC']] });
    const all = await PaymentRequest.findAll({ order: [['submitted_at', 'DESC']] });

    res.json({ success: true, pending, all });
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
});

app.post('/api/admin/payments/approve', async (req, res) => {
  const { requestId, adminPassword, adminNotes } = req.body;

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin password' });
  }

  try {
    const request = await PaymentRequest.findByPk(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'approved';
    request.reviewed_at = new Date();
    request.admin_notes = adminNotes;
    await request.save();

    // Upgrade user
    await User.update({ is_premium: true }, { where: { id: request.user_id } });

    // Create transaction record
    await Transaction.create({
      id: uuidv4(),
      user_id: request.user_id,
      amount: request.amount,
      status: 'Paid',
      date: new Date(),
      invoice_id: '#INV-' + Math.floor(Math.random() * 1000000),
      plan_type: 'Pro Plan',
      payment_method: request.payment_method
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Approve Error:", error);
    res.status(500).json({ success: false, message: 'Error approving payment' });
  }
});

app.post('/api/admin/payments/reject', async (req, res) => {
  const { requestId, adminPassword, adminNotes } = req.body;

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin password' });
  }

  try {
    const request = await PaymentRequest.findByPk(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'rejected';
    request.reviewed_at = new Date();
    request.admin_notes = adminNotes;
    await request.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ success: false, message: 'Error rejecting payment' });
  }
});

// GET USER
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ where: { id: userId } });

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
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

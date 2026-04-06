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

// --- DATABASE CONNECTION (Supabase / PostgreSQL) ---
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && (!DB_HOST || !DB_USER || !DB_PASSWORD)) {
  console.error('❌ Database credentials missing in .env!');
  console.error('   Please set DATABASE_URL (preferred) or DB_HOST, DB_USER, DB_PASSWORD.');
}

const sequelize = DATABASE_URL 
  ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      dialect: 'postgres',
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
          rejectUnauthorized: false // Often needed for Supabase
        }
      }
    });

// Test Database Connection
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Supabase (PostgreSQL) successfully.');

    // Sync models (create tables if not exist)
    await sequelize.sync();

    // Manually ensure is_verified column exists in pending_signups (safer than alter: true)
    try {
      await sequelize.query("ALTER TABLE pending_signups ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE");
    } catch (colError) {
      // Ignore if column already exists or IF NOT EXISTS isn't supported (we'll log but not crash)
      console.log('ℹ️ Note regarding is_verified column:', colError.message);
    }

    console.log('✅ Database models synced.');

    // Seed Admin User
    const adminEmail = 'admin2003@gmail.com';
    const adminUser = await User.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      console.log('👤 Creating initial Admin user...');
      const hashedPassword = await bcrypt.hash('admin@2003', 10);
      await User.create({
        id: uuidv4(), // Ensure uuidv4 is available in scope or imports
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        provider: 'email',
        is_premium: true,
        email_verified: true,
        created_at: new Date()
      });
      console.log('✅ Admin user created.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.log('   Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
}

// --- DATA MODELS ---

const User = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  picture: { type: DataTypes.TEXT('medium') }, // MEDIUMTEXT supports up to 16MB (enough for base64 images)
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

// Pending Signup Model - stores signup data until OTP verification
const PendingSignup = sequelize.define('PendingSignup', {
  id: { type: DataTypes.STRING, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: true }, // Password set in final step
  name: { type: DataTypes.STRING },
  picture: { type: DataTypes.TEXT('medium') },
  otp_code: { type: DataTypes.STRING, allowNull: false },
  otp_expires: { type: DataTypes.DATE, allowNull: false },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false }, // Track if OTP verified
  client_ip: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'pending_signups'
});

// Initialize Database Connection (After models are defined)
connectDB();

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
    message: 'MinihaAI Backend API is running (Supabase Edition)!',
    database: 'PostgreSQL (Supabase)',
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

// SIGNUP - Step 1: Request OTP with Email
app.post('/api/auth/signup', async (req, res) => {
  const { email } = req.body;
  const clientIP = getClientIP(req);

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Check if there's already a pending signup for this email
    const existingPending = await PendingSignup.findOne({ where: { email } });
    if (existingPending) {
      await existingPending.destroy();
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 15); // 15 mins expiry

    const userName = email.split('@')[0];
    const userPicture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    // Store in pending signups
    const pendingSignup = await PendingSignup.create({
      id: uuidv4(),
      email,
      name: userName,
      picture: userPicture,
      otp_code: otpCode,
      otp_expires: otpExpires,
      is_verified: false,
      client_ip: clientIP,
      created_at: new Date()
    });

    // Send OTP Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #e11d48; text-align: center;">Verify Your Email</h2>
        <p>Hi there,</p>
        <p>You requested to create an account on MinihaAI. Please use the following code to verify your email:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #fce7f3; color: #e11d48; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px; border: 1px dashed #e11d48;">${otpCode}</span>
        </div>
        
        <p>This code will expire in 15 minutes.</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Your MinihaAI Verification Code', emailHtml);
      res.status(200).json({
        success: true,
        message: 'OTP sent! Please check your email to verify.',
        requiresOtp: true,
        email: pendingSignup.email
      });
    } catch (emailErr) {
      console.error(`❌ Error sending email to ${email}:`, emailErr);
      res.status(500).json({ success: false, message: "Created request but failed to send email. Please try resending." });
    }

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// VERIFY OTP (during signup) - Step 2: Mark as verified
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otpCode } = req.body;

  try {
    const pendingSignup = await PendingSignup.findOne({ where: { email } });
    if (!pendingSignup) {
      return res.status(404).json({ success: false, message: 'No pending signup found. Please sign up first.' });
    }

    if (pendingSignup.otp_code !== otpCode) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > new Date(pendingSignup.otp_expires)) {
      await pendingSignup.destroy();
      return res.status(400).json({ success: false, message: 'OTP expired. Please sign up again.' });
    }

    // OTP Valid - Mark as verified
    pendingSignup.is_verified = true;
    await pendingSignup.save();

    res.json({
      success: true,
      message: 'Email verified successfully! Please set your password.',
      email: pendingSignup.email
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
});

// COMPLETE SIGNUP - Step 3: Set password and create account
app.post('/api/auth/complete-signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const pendingSignup = await PendingSignup.findOne({ where: { email, is_verified: true } });
    if (!pendingSignup) {
      return res.status(400).json({ success: false, message: 'Email not verified or session expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the actual user account
    const newUser = await User.create({
      id: uuidv4(),
      email: pendingSignup.email,
      password: hashedPassword,
      name: pendingSignup.name,
      picture: pendingSignup.picture,
      provider: 'email',
      is_premium: false,
      email_verified: true,
      created_at: new Date()
    });

    // Track IP
    const clientIP = pendingSignup.client_ip;
    if (clientIP && clientIP !== 'unknown') {
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

    // Delete the pending signup record
    await pendingSignup.destroy();

    res.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.picture,
        isPremium: newUser.is_premium
      }
    });

  } catch (error) {
    console.error("Complete Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error during account creation" });
  }
});

// RESEND OTP (for pending signups)
app.post('/api/auth/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if there's a pending signup
    const pendingSignup = await PendingSignup.findOne({ where: { email } });
    if (!pendingSignup) {
      return res.status(404).json({ success: false, message: 'No pending signup found. Please sign up first.' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 15); // 15 mins expiry

    pendingSignup.otp_code = otpCode;
    pendingSignup.otp_expires = otpExpires;
    await pendingSignup.save();

    // Send OTP Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #e11d48; text-align: center;">Your New Verification Code</h2>
        <p>Hi ${pendingSignup.name},</p>
        <p>Here is your new One-Time Password (OTP) to verify and create your account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #fce7f3; color: #e11d48; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px; border: 1px dashed #e11d48;">${otpCode}</span>
        </div>
        
        <p>This code will expire in 15 minutes.</p>
        <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Your New MinihaAI Verification Code', emailHtml);
      res.json({ success: true, message: 'New OTP sent! Please check your email.' });
    } catch (emailErr) {
      console.error(`❌ Error sending email to ${email}:`, emailErr);
      res.status(500).json({ success: false, message: "Failed to send email. Please try again." });
    }

  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error while resending OTP" });
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

// CHANGE PASSWORD (for logged-in users)
app.post('/api/auth/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current password, and new password are required'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "Server error while changing password" });
  }
});

// FORGOT PASSWORD (OTP)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 15);

    user.otp_code = otpCode;
    user.otp_expires = otpExpires;
    await user.save();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #e11d48; text-align: center;">Reset Your Password</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Use the code below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #fce7f3; color: #e11d48; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px; border: 1px dashed #e11d48;">${otpCode}</span>
        </div>
        <p>This code expires in 15 minutes.</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Reset Password Code', emailHtml);
    } catch (e) {
      console.error("Email send error", e);
    }

    res.json({ success: true, message: 'OTP sent to email. Please check your inbox.' });

  } catch (error) {
    console.error("Forgot pass error:", error);
    res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
});

// RESET PASSWORD (Confirm OTP)
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.otp_code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp_code = null;
    user.otp_expires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (err) {
    console.error("Reset pass error:", err);
    res.status(500).json({ success: false, message: 'Reset failed' });
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
    const user = await User.findByPk(userId);
    if (user) {
      user.is_premium = true;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      user.premium_expires_at = expiry;
      await user.save();
    }

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

// --- GEMINI API PROXY (Secure - API key on backend only) ---
// Initialize Gemini client (Wrapper if needed, but we use direct REST for control)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Cache for available models
let availableModelsCache = null;
let modelsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get available models from API
const getAvailableModels = async (apiKey) => {
  const now = Date.now();
  if (availableModelsCache && (now - modelsCacheTime) < CACHE_DURATION) {
    return availableModelsCache;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    const models = (response.data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));

    availableModelsCache = models;
    modelsCacheTime = now;
    console.log(`📋 Available models: ${models.join(', ')}`);
    return models;
  } catch (error) {
    console.log('⚠️ Could not fetch available models, using defaults');
    // Fallback to default models
    return ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  }
};

// Use REST API directly for better control and error handling
const callGeminiAPI = async (prompt, config = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Get available models dynamically
  let availableModels = await getAvailableModels(apiKey);
  const errors = [];

  // OPTIMIZED: Prioritize faster models first (Flash is faster than Pro)
  availableModels = availableModels.sort((a, b) => {
    // Prioritize flash models for speed
    if (a.includes('flash') && !b.includes('flash')) return -1;
    if (!a.includes('flash') && b.includes('flash')) return 1;
    // Prioritize 2.0 models
    if (a.includes('2.0') && !b.includes('2.0')) return -1;
    if (!a.includes('2.0') && b.includes('2.0')) return 1;
    return 0;
  });

  for (const modelName of availableModels) {
    try {
      // Use v1beta API (standard for Gemini)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.9,
          topP: config.topP || 0.95,
          topK: config.topK || 40,
          maxOutputTokens: config.maxOutputTokens || 8192, // Limit tokens for faster response
          ...(config.responseMimeType && { responseMimeType: config.responseMimeType }),
          ...Object.fromEntries(Object.entries(config).filter(([k]) => !['temperature', 'topP', 'topK', 'responseMimeType', 'maxOutputTokens'].includes(k)))
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000 // 45 second timeout (reduced from default for faster failure)
      });

      const data = response.data;
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        console.log(`✅ Using model: ${modelName}`);
        return {
          text: data.candidates[0].content.parts[0].text,
          modelName
        };
      } else {
        errors.push(`${modelName}: Invalid response format`);
        console.log(`❌ Model ${modelName}: Invalid response format`);
      }
    } catch (error) {
      let errorMsg = error.message;
      if (error.response) {
        // Axios error with response
        const errorData = error.response.data || {};
        errorMsg = errorData.error?.message || error.response.statusText || error.message;
        errors.push(`${modelName}: ${error.response.status} - ${errorMsg}`);
        console.log(`❌ Model ${modelName} failed: ${error.response.status} - ${errorMsg}`);
      } else {
        errors.push(`${modelName}: ${errorMsg}`);
        console.log(`❌ Model ${modelName} error: ${errorMsg}`);
      }
      continue;
    }
  }

  // Return detailed error with all attempted models
  throw new Error(`All Gemini models failed. Errors: ${errors.join('; ')}. Please check your API key in Railway and verify it's active in Google AI Studio.`);
};

// Helper functions
const preprocessText = (text) => {
  return text
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .trim();
};

const postprocessText = (text) => {
  let result = text.trim();

  // Remove any AI metadata or word count statements (AI sometimes adds these despite instructions)
  result = result.replace(/\(?\d+\s*words?\)?/gi, ''); // Remove "(X words)" or "X words"
  result = result.replace(/word\s*count:?\s*\d+/gi, ''); // Remove "Word count: X" or "Word count X"
  result = result.replace(/total:?\s*\d+\s*words?/gi, ''); // Remove "Total: X words" or "Total X words"
  result = result.replace(/\[\d+\s*words?\]/gi, ''); // Remove "[X words]"

  // Remove all markdown formatting - do this first
  result = result.replace(/```[\s\S]*?```/g, ''); // Remove code blocks first
  result = result.replace(/`([^`]+)`/g, '$1'); // Remove inline code
  result = result.replace(/\*\*/g, ''); // Remove bold **text** (double asterisks)
  result = result.replace(/\*/g, ''); // Remove ALL single asterisks (italic *text* and standalone *)
  result = result.replace(/__/g, ''); // Remove bold __text__
  result = result.replace(/_/g, ''); // Remove italic _text_ and single underscores
  result = result.replace(/~~/g, ''); // Remove strikethrough ~~text~~
  result = result.replace(/#{1,6}\s/g, ''); // Remove markdown headers (# ## ###)
  result = result.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Convert [link](url) to just "link"

  // Remove any remaining formatting characters
  result = result.replace(/`/g, ''); // Remove any remaining backticks

  // Remove quotes around text
  result = result.replace(/^["']|["']$/g, '');

  // Clean up excessive newlines
  result = result.replace(/\n{3,}/g, '\n\n');

  // Remove any remaining asterisks in various patterns (safety check)
  result = result.replace(/\s\*\s/g, ' '); // Remove " * " patterns
  result = result.replace(/\*\s/g, ''); // Remove "* " at start of words
  result = result.replace(/\s\*/g, ''); // Remove " *" at end of words
  result = result.replace(/\*/g, ''); // Final pass - remove ANY remaining asterisks

  // Clean up multiple spaces that may have been created
  result = result.replace(/\s{2,}/g, ' ');

  // Clean up spaces around punctuation
  result = result.replace(/\s+([.,!?;:])/g, '$1');

  return result.trim();
};

// Helper functions for tone, vocabulary, and intensity settings
const getToneInstructions = (tone) => {
  const toneMap = {
    'Standard': `TONE: Standard/Balanced
- Write in a balanced, clear, and straightforward manner
- Use a mix of formal and casual language naturally
- Maintain professional clarity without being overly formal
- Sound like an educated, thoughtful person writing naturally
- Use contractions moderately (30-40%)
- Include occasional personal touches: "I think", "It seems", "You might notice"
- Keep it engaging but not overly casual or formal`,

    'Casual': `TONE: Casual/Conversational
- Write like you're talking to a friend - relaxed and natural
- Use contractions frequently (60-70%): "don't", "can't", "won't", "it's", "that's", "we're"
- Add conversational fillers naturally: "you know", "I mean", "like", "sort of", "kind of"
- Use casual transitions: "Plus", "Also", "And", "But", "So", "Then", "Now", "Well", "Actually"
- Include personal touches: "I think", "I've noticed", "You might", "Honestly", "Really"
- Use "you" and "we" frequently - make it feel like a conversation
- Add occasional uncertainty: "maybe", "perhaps", "might", "could be", "I guess", "probably"
- Keep sentences shorter and more direct
- Use exclamation marks occasionally for enthusiasm
- Sound friendly and approachable, like a real person chatting`,

    'Professional': `TONE: Professional/Business
- Write in a polished, business-appropriate style
- Use contractions sparingly (20-30%) - more formal but still natural
- Maintain professional clarity and precision
- Use "we" and "you" appropriately for business context
- Include professional phrases: "It's important to note", "One consideration is", "A key point is"
- Keep transitions professional but natural: "Additionally", "However", "Therefore", "In this case"
- Avoid overly casual language but don't sound robotic
- Use active voice for clarity and impact
- Sound like a skilled professional writing naturally, not a corporate robot
- Maintain authority while being approachable`,

    'Academic': `TONE: Academic/Scholarly
- Write in a scholarly, analytical style appropriate for academic work
- Use contractions minimally (10-20%) - more formal structure
- Employ academic vocabulary appropriately but naturally
- Use "one" and passive voice more frequently (40-50% passive) for academic style
- Include analytical phrases: "It can be observed that", "One might argue", "This suggests that", "It appears that"
- Use transitions: "Furthermore", "However", "Consequently", "In contrast", "Similarly"
- Maintain objectivity while showing critical thinking
- Use longer, more complex sentences (but still vary them)
- Sound like a thoughtful academic writing naturally, not a textbook
- Balance formality with readability`,

    'Witty': `TONE: Witty/Clever
- Write with humor, cleverness, and personality
- Use contractions frequently (50-60%) for a lively feel
- Add witty observations and clever turns of phrase
- Include rhetorical questions for effect (3-4 per 500 words)
- Use unexpected word choices and playful language
- Add subtle humor and irony where appropriate
- Use dashes and parentheses for witty asides
- Include conversational elements: "you know", "I mean", "sort of"
- Make it engaging and entertaining while maintaining quality
- Sound like a clever, witty person writing naturally
- Use exclamation marks and question marks for emphasis`,

    'Empathetic': `TONE: Empathetic/Understanding
- Write with warmth, understanding, and emotional intelligence
- Use contractions moderately (40-50%) for a warm, approachable feel
- Include empathetic phrases: "I understand", "It's understandable that", "Many people feel", "You might be experiencing"
- Use "you" frequently to connect with the reader
- Add personal touches: "I've found", "In my experience", "What I've noticed"
- Use softer language and understanding transitions: "And", "But", "So", "Also", "Plus"
- Include questions that show understanding: "Have you ever noticed?", "Does this resonate?"
- Sound caring and understanding, like someone who truly gets it
- Use emotional language appropriately but authentically
- Make it feel supportive and human`,

    'Persuasive': `TONE: Persuasive/Convincing
- Write to persuade and convince while remaining natural
- Use contractions moderately (30-40%) for a balanced persuasive tone
- Employ persuasive techniques naturally: rhetorical questions, strong statements, compelling examples
- Use active voice for impact (80-90%)
- Include persuasive phrases: "Consider this", "Think about it", "Here's the thing", "The key point is"
- Use transitions that build argument: "And", "But", "So", "Plus", "Also", "Now", "Here's why"
- Add personal conviction: "I believe", "I'm convinced", "It's clear that", "The evidence shows"
- Use "you" to directly address the reader
- Sound confident and convincing, like someone who truly believes what they're saying
- Make compelling arguments while maintaining natural human voice
- Use questions strategically to engage and persuade`
  };
  return toneMap[tone] || toneMap['Standard'];
};

const getVocabularyInstructions = (vocabulary) => {
  const vocabMap = {
    'Simple (High School)': `VOCABULARY: Simple/High School Level
- Use everyday, accessible words that most people understand
- Avoid complex or technical terms unless necessary (and explain them if used)
- Use simple, direct language: "use" instead of "utilize", "help" instead of "facilitate", "show" instead of "demonstrate"
- Keep sentences clear and straightforward
- Use common words: "big" instead of "substantial", "good" instead of "beneficial", "bad" instead of "detrimental"
- Explain complex ideas in simple terms
- Use contractions frequently (50-60%) for naturalness
- Sound like an intelligent person writing simply, not condescending`,

    'Standard (College)': `VOCABULARY: Standard/College Level
- Use a balanced mix of everyday and more sophisticated words
- Employ appropriate vocabulary for educated readers
- Mix simple and complex words naturally: "use" and "utilize" both, "help" and "facilitate" both
- Use precise words when needed: "demonstrate" when appropriate, "show" when simpler works
- Balance accessibility with sophistication
- Use contractions moderately (30-40%)
- Sound like a well-educated person writing naturally
- Choose words that fit the context - not too simple, not too complex`,

    'Advanced (PhD)': `VOCABULARY: Advanced/PhD Level
- Use sophisticated, precise vocabulary appropriate for advanced readers
- Employ technical and academic terms when appropriate
- Use precise words: "utilize" when precise, "facilitate" when appropriate, "demonstrate" for clarity
- Include nuanced vocabulary: "substantial" when precise, "beneficial" when appropriate, "detrimental" when needed
- Use complex sentence structures naturally (but still vary them)
- Use contractions sparingly (20-30%) for more formal tone
- Sound like an expert writing naturally, not showing off
- Balance sophistication with clarity - don't be unnecessarily complex`
  };
  return vocabMap[vocabulary] || vocabMap['Standard (College)'];
};

const getIntensityInstructions = (intensity) => {
  const intensityLevel = parseInt(intensity) || 50;

  if (intensityLevel <= 30) {
    return `HUMANIZATION INTENSITY: Light (${intensityLevel}%)
- Apply subtle humanization - maintain more of the original structure
- Add moderate sentence variation (20% short, 50% medium, 30% long)
- Use fragments sparingly (3-5% of sentences)
- Add minimal imperfections - keep it polished
- Use contractions moderately
- Keep transitions more standard but still natural
- Maintain closer to original flow while adding human touches`;
  } else if (intensityLevel <= 70) {
    return `HUMANIZATION INTENSITY: Moderate (${intensityLevel}%)
- Apply balanced humanization - natural variation
- Mix sentence lengths: 30% short, 40% medium, 30% long
- Use fragments strategically (5-10% of sentences)
- Add moderate imperfections that feel natural
- Use contractions appropriately (30-50%)
- Vary transitions naturally
- Create natural flow with good variation`;
  } else {
    return `HUMANIZATION INTENSITY: Maximum (${intensityLevel}%)
- Apply aggressive humanization - maximum naturalness
- Heavy sentence variation: 35% short, 30% medium, 35% long
- Use fragments frequently (10-15% of sentences)
- Add more imperfections and natural quirks
- Use contractions frequently (50-70%)
- Vary transitions extensively - no repetition
- Create highly varied, natural flow
- Maximum sentence structure variation
- More personal touches and conversational elements
- More uncertainty markers: "maybe", "perhaps", "might", "could be"
- More natural imperfections and human quirks`;
  }
};

// Humanize text endpoint - OPTIMIZED 2-PASS VERSION (maintains quality, ~2x faster)
// Pass 1: Deep humanization with anti-detection rules
// Pass 2: Combined quality enhancement & final polish (merges previous passes 2, 3, 4)
app.post('/api/ai/humanize', async (req, res) => {
  try {
    const { text, tone = 'Standard', vocabulary = 'Standard (College)', intensity = 50 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const cleanInput = preprocessText(text);

    // Calculate original word count for strict length enforcement
    const originalWordCount = cleanInput.split(/\s+/).filter(w => w.length > 0).length;
    console.log(`📊 Original word count: ${originalWordCount} words`);

    // Higher temperature for maximum human-like variation (100% AI-free)
    const baseTemp = 1.0 + (intensity / 100) * 0.9;
    const temperature = Math.min(Math.max(baseTemp, 0.9), 2.0);

    // Get setting-specific instructions
    const toneInstructions = getToneInstructions(tone);
    const vocabInstructions = getVocabularyInstructions(vocabulary);
    const intensityInstructions = getIntensityInstructions(intensity);

    // Pass 1: Deep Humanization - Break AI Patterns & Create Natural Flow
    const promptPass1 = `You are an Elite Anti-Detection Ghostwriter with expertise in bypassing ALL AI detection systems.
Your mission: Rewrite this text to be 100% UNDETECTABLE by Turnitin, GPTZero, Originality.ai, Copyleaks, ZeroGPT, Content at Scale, Writer.com, Sapling, Winston AI, Crossplag, and ALL other detectors.

CRITICAL: The output must be 100% AI-FREE, HIGH QUALITY, natural, and completely human-written. This text must pass every AI detector with 0% detection rate. Maintain all meaning while making it completely undetectable.

⚠️ ABSOLUTE LENGTH CONSTRAINT ⚠️
ORIGINAL TEXT WORD COUNT: ${originalWordCount} words
YOUR OUTPUT MUST NOT EXCEED ${Math.ceil(originalWordCount * 1.05)} words (max 5% increase allowed).
COUNT YOUR WORDS. If you go over, you FAIL this task. BE CONCISE.

${toneInstructions}

${vocabInstructions}

${intensityInstructions}

CRITICAL ANTI-DETECTION RULES (100% AI-FREE REQUIREMENTS):

1. SENTENCE STRUCTURE VARIATION (CRITICAL - AI DETECTORS LOOK FOR PATTERNS):
   - Mix sentence lengths aggressively based on intensity level above
   - NEVER have 3 consecutive sentences of similar length
   - AVOID choppy writing: Don't create many short sentences in a row (e.g., "This is good. It works. I like it.")
   - Connect ideas naturally using commas, dashes, and conjunctions - humans flow ideas together
   - Vary sentence beginnings randomly: Start with subjects, prepositions, conjunctions, adverbs, questions, fragments
   - Use fragments strategically based on intensity level (humans use fragments, AI rarely does)
   - Add occasional run-on sentences that feel natural (AI avoids these)
   - Break parallel structures completely - humans NEVER write perfectly parallel
   - Vary sentence complexity: simple, compound, complex, compound-complex randomly
   - Add occasional incomplete thoughts or trailing sentences
   - Use one-word sentences occasionally for emphasis - but sparingly

2. BANNED AI WORDS (NEVER USE - THESE ARE AI RED FLAGS):
   "delve", "tapestry", "realm", "landscape", "underscores", "crucial", "leverage", "utilize", "orchestrate", 
   "testament", "pivotal", "nuance", "foster", "harness", "unveil", "embark", "navigate", "unlock", 
   "catalyst", "cornerstone", "showcase", "facilitate", "endeavor", "paramount", "myriad", "plethora",
   "inherent", "intrinsic", "comprehensive", "robust", "seamless", "streamline", "optimize", "synergy",
   "delve into", "in the realm of", "it is worth noting", "it should be noted", "it is important to",
   "in order to", "with regard to", "in terms of", "as a result of", "due to the fact that"

3. BANNED AI TRANSITIONS (NEVER USE - INSTANT AI DETECTION):
   "Moreover", "Furthermore", "In conclusion", "Additionally", "Conversely", "Notably", "Thus", "Hence",
   "Consequently", "Accordingly", "Subsequently", "Nevertheless", "Nonetheless", "In essence", "To summarize",
   "In summary", "Ultimately", "In other words", "That is to say", "To begin with", "First and foremost",
   "Last but not least", "In the final analysis", "To put it simply", "In a nutshell"

4. USE HUMAN TRANSITIONS INSTEAD (based on tone - these sound natural):
   "Plus", "Also", "And", "But", "So", "Then", "Now", "Well", "Actually", "Honestly", "Really", "I mean",
   "You know", "Like", "Kind of", "Sort of", "Pretty much", "Basically", "Anyway", "Oh", "Yeah", "Right",
   "See", "Look", "I guess", "I suppose", "Or", "Though", "Still", "Yet", "Even so", "At the same time"

5. VOCABULARY & WORD CHOICE (CRITICAL FOR AI DETECTION):
   - Follow vocabulary level instructions above strictly
   - Use contractions based on tone instructions (AI underuses contractions)
   - Add filler words based on tone (casual tones use more) - AI avoids these
   - Use "really", "very", "pretty", "quite", "sort of", "kind of" naturally (humans overuse these, AI doesn't)
   - Avoid perfect synonyms - repeat words occasionally (humans do this, AI avoids it)
   - Use specific, concrete words instead of vague abstract ones when possible
   - Choose words that feel natural in context, not forced or overly formal
   - Vary word choice - don't use the same word twice in close proximity unless intentional
   - Use colloquialisms and informal expressions where appropriate
   - Mix formal and informal language naturally (AI tends to be consistent)
   - Use "thing", "stuff", "get", "go", "make" - simple words humans use frequently

6. GRAMMAR & PUNCTUATION (IMPERFECTIONS = HUMAN):
   - FLOW NATURALLY: Use commas to connect related ideas instead of breaking them with periods
   - When you want to use a period, consider if a comma or "and"/"but" would sound more natural
   - Allow intentional comma splices based on intensity (5-8% for moderate, 3-5% for light, 8-12% for maximum)


   - NEVER USE EM-DASHES (—) or EN-DASHES (–) - only use regular hyphens (-) if needed
   - Use parentheses for asides (humans do this, AI rarely does)
   - Mix question marks and exclamation marks naturally
   - Don't fix every grammar "error" - keep some for authenticity
   - NEVER USE SEMICOLONS (;) - humans avoid them, AI overuses them - use commas or periods instead
   - Add occasional typos-like patterns: "its" vs "it's" confusion (but be careful)
   - Use sentence fragments that feel natural

7. PARAGRAPH STRUCTURE (CRITICAL - AI DETECTORS ANALYZE STRUCTURE):
   - Vary paragraph lengths dramatically: 1-10 sentences per paragraph (AI tends to be consistent)
   - Some paragraphs should be 1-2 sentences (humans do this, AI rarely does)
   - Some paragraphs should be longer (8-10 sentences) - AI tends to keep them medium
   - Don't always start paragraphs with topic sentences (AI always does this)
   - Bury main points in the middle of paragraphs sometimes (AI puts them at start/end)
   - End paragraphs with questions or incomplete thoughts occasionally
   - Start some paragraphs mid-thought or with a continuation
   - Mix short and long paragraphs randomly - no pattern

8. VOICE & TONE (HUMAN VOICE = UNDETECTABLE):
   - Follow tone instructions above strictly
   - Add personal touches based on tone (see tone instructions) - AI avoids personal touches
   - Use rhetorical questions based on tone (witty uses more, academic uses fewer) - AI underuses questions
   - Add conversational asides in parentheses (humans do this naturally, AI rarely does)
   - Use "we" and "you" based on tone instructions (AI overuses "one" and passive voice)
   - Include occasional uncertainty based on tone and intensity: "maybe", "perhaps", "might", "could be", "I think", "probably", "I guess", "I suppose" (AI is too confident)
   - Add subtle opinions or observations that show human thinking (AI avoids opinions)
   - Use active voice based on tone (persuasive uses more, academic uses less) - but vary it
   - Make the writing engaging and readable, not robotic
   - Add emotional language where appropriate (AI avoids emotions)
   - Use "I", "me", "my" occasionally to show personal perspective (AI avoids first person)
   - Include occasional self-corrections: "or rather", "I mean", "actually" (AI doesn't self-correct)

9. INFORMATION ORDER (DISORGANIZATION = HUMAN):
   - Don't always present information in logical order (AI is always logical)
   - Add tangents and return to main point (AI stays on topic)
   - Bury important info in the middle, not always at start/end (AI highlights important info)
   - Repeat ideas with different wording (humans do this, AI avoids repetition)
   - Jump between topics slightly (AI maintains strict coherence)
   - Add digressions that feel natural (AI avoids digressions)
   - Present information in a slightly scattered way (AI is too organized)

10. WRITING PATTERNS (BREAK AI PATTERNS):
    - Vary sentence openings: Never start 2 consecutive sentences the same way
    - Mix declarative, interrogative, imperative, exclamatory sentences
    - Use "and" and "but" to start sentences occasionally (AI avoids this)
    - Add interjections: "Oh", "Well", "Hmm", "Ah", "Huh" (AI never uses these)
    - Use repetition for emphasis (AI avoids repetition)
    - Include redundant phrases: "each and every", "first and foremost" (AI avoids redundancy)
    - Use idioms and colloquialisms naturally (AI struggles with idioms)
    - Add regional expressions or casual language (AI uses standard English)

11. FORMATTING & LENGTH (CRITICAL):
    - NO bullet points, NO numbered lists (AI loves lists)
    - NO bold, NO headings, NO subheadings.
    - Continuous natural paragraphs only.
    - LENGTH CONSTRAINT: Do not significantly exceed the original word count. Keep it tight.
    - Write plain text only.

12. AI DETECTION BYPASS TECHNIQUES (CRITICAL):
    - Add "thinking out loud" moments: "I'm thinking...", "Hmm..."
    - Include self-doubt: "I'm not sure but...", "This might be wrong but..."
    - Add personal anecdotes or examples (AI avoids personal stories)
    - Use specific numbers and dates (AI uses vague references)
    - Include cultural references or pop culture.
    - Add humor or wit (AI struggles with humor)
    - Use metaphors and similes naturally.
    - Include contradictions or changing opinions.
    - Add "stream of consciousness" moments.

INPUT TEXT TO HUMANIZE (${originalWordCount} words):
"${cleanInput}"

CRITICAL REMINDERS:
1. STRICTLY ADHERE TO THE TONE "${tone}" (see persona above)
2. YOUR OUTPUT MUST NOT EXCEED ${Math.ceil(originalWordCount * 1.05)} WORDS
3. This text MUST be 100% AI-FREE and pass ALL detectors with 0% detection rate
4. OUTPUT ONLY THE REWRITTEN TEXT - NO word count, NO metadata, NO explanations, NO notes

Rewrite this text following ALL rules above. Make it sound like a real, skilled human wrote it in the specified tone and vocabulary level - natural, engaging, high-quality, and completely undetectable. Add human imperfections, personal touches, and natural variation. Maintain all original meaning while making it feel authentically human. BE CONCISE - do not add unnecessary words. DO NOT include word count or any metadata in your output.`;

    const result1 = await callGeminiAPI(promptPass1, {
      temperature: temperature,
      topP: 0.998, // Higher for more variation
      topK: 150, // Higher for more word variety
    });

    const draft1 = result1.text || '';
    if (!draft1) throw new Error('Phase 1 generation failed');

    // OPTIMIZED Pass 2: Combined Quality Enhancement & Final Polish (Merges Pass 2, 3, 4 into one efficient pass)
    const promptPass2 = `You are a Master Humanization Editor. This text MUST be 100% AI-FREE and pass ALL detectors. Perform final quality enhancement and polish in ONE pass.

⚠️ ABSOLUTE LENGTH CONSTRAINT ⚠️
ORIGINAL INPUT: ${originalWordCount} words
MAXIMUM ALLOWED OUTPUT: ${Math.ceil(originalWordCount * 1.05)} words (max 5% increase)
YOU MUST COUNT YOUR WORDS. If you exceed this limit, you FAIL.

SETTINGS:
- Tone: ${tone}
- Vocabulary: ${vocabulary}
- Intensity: ${intensity}%

${toneInstructions}

${vocabInstructions}

${intensityInstructions}

CRITICAL FINAL CHECKS (ALL IN ONE PASS):
1. ABSOLUTE WORD COUNT: Count your output words. MUST NOT exceed ${Math.ceil(originalWordCount * 1.05)} words. CUT ruthlessly if needed.
2. TONE ENFORCEMENT: The text must sound EXACTLY like the "${tone}" persona (e.g., Casual = slang/fragments, Academic = formal/analytical).
3. NATURAL FLOW: Avoid choppy writing with too many short sentences and periods. Connect ideas with commas, dashes, "and", "but", "so".
4. SENTENCE VARIETY: Ensure NO two consecutive sentences share structure, length, or opening. Vary rhythm aggressively.
5. HUMAN IMPERFECTIONS: Add natural imperfections based on intensity (light: 3-4, moderate: 5-7, max: 7-10) - awkward phrases, slight contradictions, incomplete thoughts.
6. WORD REPETITION: Repeat key words 2-4 times naturally (humans repeat, AI doesn't).
6. TRANSITION VARIETY: Vary transitions constantly. Use simple ones: "Plus", "But", "So" (NOT "Moreover", "Furthermore").
7. PERSONAL TOUCHES: Add "maybe", "I think", "probably", "you know", "sort of" based on tone.
8. HUMAN QUIRKS: Include self-corrections ("or rather", "I mean"), thinking out loud ("Hmm...", "Well..."), personal asides in parentheses.
9. GRAMMAR IMPERFECTIONS: Keep intentional quirks (fragments, comma splices, run-ons) based on intensity.
10. PUNCTUATION VARIETY: Use parentheses naturally. NEVER USE SEMICOLONS (;) or EM-DASHES (—) or EN-DASHES (–) - only use regular hyphens (-), commas, or periods.
11. REMOVE ROBOTIC PHRASES: Eliminate "In conclusion", "Furthermore", "Moreover", "Additionally" - these are AI red flags.
12. COHERENCE: Ideas flow logically but imperfectly - add slight disorganization.
13. TONE/VOCAB CONSISTENCY: Verify matches specified tone and vocabulary throughout.
14. AI PATTERN CHECK: Break perfect structures, eliminate repetitive patterns, remove overly formal language.
15. QUALITY & CLARITY: Ensure meaning is clear and writing is engaging despite imperfections.
16. PLAIN TEXT ONLY: Remove ALL markdown, asterisks, formatting symbols.
17. FINAL VERIFICATION: If ANY part sounds like AI or exceeds word limit, rewrite with more human touches and aggressive cutting.

DRAFT TEXT:
"${draft1}"

Apply final humanization polish. STRICTLY ADHERE TO THE TONE "${tone}" and DO NOT EXCEED ${Math.ceil(originalWordCount * 1.05)} WORDS. This MUST be 100% AI-FREE, HIGH QUALITY, and read like a skilled human wrote it. 

OUTPUT INSTRUCTIONS:
- Output ONLY the humanized text itself
- NO word count statements (e.g., "150 words", "(X words)", etc.)
- NO metadata, explanations, or notes
- NO markdown formatting symbols
- Just the plain, humanized text and nothing else`;

    const result2 = await callGeminiAPI(promptPass2, {
      temperature: Math.max(temperature - 0.05, 0.85), // Keep higher for variation
      topP: 0.995, // Higher for more variation
      topK: 145, // Higher for more word variety
    });

    const finalDraft = result2.text || draft1;
    const finalText = postprocessText(finalDraft);

    // Verify and log final word count
    const finalWordCount = finalText.split(/\s+/).filter(w => w.length > 0).length;
    const wordCountChange = ((finalWordCount - originalWordCount) / originalWordCount * 100).toFixed(1);
    console.log(`📊 Word count: ${originalWordCount} → ${finalWordCount} (${wordCountChange > 0 ? '+' : ''}${wordCountChange}%)`);

    res.status(200).json({ success: true, text: finalText });
  } catch (error) {
    console.error('Humanize Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to humanize text. Please try again.'
    });
  }
});

// Helper function to split text into sentences
const splitIntoSentences = (text) => {
  // Split by sentence-ending punctuation, but keep the punctuation
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  // Also handle sentences without ending punctuation
  const remaining = text.replace(/[^.!?]+[.!?]+/g, '').trim();
  if (remaining) {
    sentences.push(remaining);
  }
  return sentences.filter(s => s.trim().length > 0);
};

// Helper function to calculate text metrics
const calculateTextMetrics = (text) => {
  const sentences = splitIntoSentences(text);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));

  const avgSentenceLength = sentences.length > 0
    ? words.length / sentences.length
    : 0;

  const vocabularyRichness = words.length > 0
    ? (uniqueWords.size / words.length) * 100
    : 0;

  // Calculate burstiness (variation in sentence lengths)
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 1;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length || 0;
  const burstiness = Math.sqrt(variance) / avgLength;

  return {
    averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    vocabularyRichness: Math.round(vocabularyRichness * 10) / 10,
    burstiness: Math.round(burstiness * 100) / 100
  };
};

// Detect AI content endpoint - Enhanced with advanced detection
app.post('/api/ai/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    // Limit text length for processing (15,000 characters like ZeroGPT)
    const maxLength = 15000;
    const processedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    // Calculate text metrics
    const metrics = calculateTextMetrics(processedText);

    // Split into sentences for detailed analysis
    const sentences = splitIntoSentences(processedText);

    // Advanced AI detection prompt
    const detectionPrompt = `You are an expert AI content detector analyzing text to determine if it was generated by AI (ChatGPT, GPT-4, GPT-5, Gemini, Claude, etc.) or written by a human.

ANALYSIS CRITERIA:
1. Sentence Structure: AI tends to use consistent, parallel structures. Humans vary sentence length and structure.
2. Vocabulary Patterns: AI often uses formal, repetitive word choices. Humans use more varied, natural vocabulary.
3. Transitions: AI uses formal transitions like "Furthermore", "Moreover", "Additionally". Humans use casual ones like "Plus", "Also", "But", "So".
4. Perplexity: AI text has lower perplexity (more predictable). Human text has higher perplexity.
5. Burstiness: AI has low burstiness (consistent sentence lengths). Humans have high burstiness (varied lengths).
6. Personal Touch: AI avoids personal pronouns and opinions. Humans include personal touches.
7. Imperfections: AI text is too perfect. Human text has natural imperfections.
8. Repetition: AI avoids word repetition. Humans repeat words naturally.
9. Sentence Variety: AI uses similar sentence structures. Humans vary extensively.

TEXT TO ANALYZE (${processedText.length} characters):
"${processedText}"

TEXT METRICS:
- Average Sentence Length: ${metrics.averageSentenceLength} words
- Vocabulary Richness: ${metrics.vocabularyRichness}%
- Burstiness: ${metrics.burstiness}

Provide a comprehensive analysis in JSON format:
{
  "score": 0-100 (0 = definitely human, 100 = definitely AI),
  "label": "Human-Written" | "Mixed/Edited" | "Fully AI-Generated",
  "analysis": "Detailed explanation of why this text appears to be AI or human, citing specific patterns, metrics, and evidence",
  "sentences": [
    {
      "sentence": "exact sentence text",
      "aiProbability": 0-100,
      "isHighlighted": true/false (true if aiProbability > 50)
    }
  ],
  "detectedModels": ["possible AI models that might have generated this, e.g., ChatGPT, GPT-4, Gemini, Claude, or empty array if human"]
}

Analyze each sentence individually and provide sentence-by-sentence AI probability scores. Highlight sentences with AI probability > 50%.`;

    const result = await callGeminiAPI(detectionPrompt, {
      responseMimeType: 'application/json',
      temperature: 0.3 // Lower temperature for more consistent detection
    });

    const responseText = result.text;
    let detectionResult;

    try {
      // Try to parse JSON, handling cases where it might be wrapped in markdown
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      detectionResult = JSON.parse(cleanedText);

      // Ensure score is between 0-100
      detectionResult.score = Math.max(0, Math.min(100, detectionResult.score || 0));

      // Add metrics to result
      detectionResult.metrics = metrics;

      // Ensure sentences array exists and is properly formatted
      if (!detectionResult.sentences || !Array.isArray(detectionResult.sentences)) {
        // Fallback: create sentence analysis from actual sentences
        detectionResult.sentences = sentences.slice(0, 50).map((sentence, index) => {
          // Estimate AI probability based on overall score and sentence characteristics
          const sentenceLength = sentence.split(/\s+/).length;
          const hasFormalTransitions = /(furthermore|moreover|additionally|consequently|therefore|thus|hence)/i.test(sentence);
          const hasCasualTransitions = /(plus|also|but|so|then|now|well|actually)/i.test(sentence);

          let sentenceScore = detectionResult.score;
          if (hasFormalTransitions && !hasCasualTransitions) {
            sentenceScore = Math.min(100, sentenceScore + 15);
          } else if (hasCasualTransitions) {
            sentenceScore = Math.max(0, sentenceScore - 10);
          }

          // Adjust based on sentence length variation
          if (sentenceLength < 5 || sentenceLength > 30) {
            sentenceScore = Math.max(0, sentenceScore - 5); // Shorter or longer sentences are more human-like
          }

          return {
            sentence: sentence.trim(),
            aiProbability: Math.max(0, Math.min(100, Math.round(sentenceScore))),
            isHighlighted: sentenceScore > 50
          };
        });
      } else {
        // Validate and fix sentence data
        detectionResult.sentences = detectionResult.sentences.map(s => ({
          sentence: s.sentence || '',
          aiProbability: Math.max(0, Math.min(100, s.aiProbability || 0)),
          isHighlighted: (s.aiProbability || 0) > 50
        }));
      }

      // Ensure detectedModels is an array
      if (!detectionResult.detectedModels || !Array.isArray(detectionResult.detectedModels)) {
        detectionResult.detectedModels = detectionResult.detectedModels ? [detectionResult.detectedModels] : [];
      }

    } catch (e) {
      console.error('JSON Parse Error:', e);
      console.error('Response text:', responseText.substring(0, 500));

      // Fallback: create basic detection result
      const sentences = splitIntoSentences(processedText);
      detectionResult = {
        score: 50, // Neutral score
        label: 'Analysis Error',
        analysis: 'Could not parse detailed detection results. Basic analysis: The text shows mixed characteristics that make it difficult to determine with certainty.',
        sentences: sentences.slice(0, 50).map(sentence => ({
          sentence: sentence.trim(),
          aiProbability: 50,
          isHighlighted: false
        })),
        metrics: metrics,
        detectedModels: []
      };
    }

    res.status(200).json({ success: true, ...detectionResult });
  } catch (error) {
    console.error('Detection Error:', error);
    res.status(500).json({
      success: false,
      score: 0,
      label: 'Connection Error',
      analysis: 'Unable to reach the detection service. Please try again.',
      sentences: [],
      metrics: {},
      detectedModels: []
    });
  }
});

// Evaluate quality endpoint
app.post('/api/ai/evaluate', async (req, res) => {
  try {
    const { original, rewritten } = req.body;

    if (!original || !rewritten) {
      return res.status(400).json({ success: false, message: 'Original and rewritten text are required' });
    }

    const prompt = `You are a Senior Editor. Compare the ORIGINAL AI text with the REWRITTEN humanized version.

Evaluate on:
1. Human-Likeness: Does it sound authentically human?
2. Meaning Preservation: Is the core message preserved?
3. Sentence Variety: Good mix of short and long sentences?

ORIGINAL: "${original.substring(0, 1000)}"
REWRITTEN: "${rewritten.substring(0, 1000)}"

Provide JSON:
{
  "humanScore": 0-100 (100 = perfectly natural),
  "meaningPreserved": true/false,
  "sentenceVariety": "Short assessment",
  "feedback": "One sentence of constructive feedback"
}`;

    const result = await callGeminiAPI(prompt, {
      responseMimeType: 'application/json'
    });

    const responseText = result.text;
    let evaluationResult;

    try {
      evaluationResult = JSON.parse(responseText);
    } catch (e) {
      evaluationResult = {
        humanScore: 0,
        meaningPreserved: false,
        sentenceVariety: 'Unable to evaluate',
        feedback: 'Could not parse evaluation results.'
      };
    }

    res.status(200).json({ success: true, ...evaluationResult });
  } catch (error) {
    console.error('Evaluation Error:', error);
    res.status(500).json({
      success: false,
      humanScore: 0,
      meaningPreserved: false,
      sentenceVariety: 'Error',
      feedback: 'Failed to evaluate quality.'
    });
  }
});

// List available models endpoint
app.get('/api/ai/list-models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not set in Railway environment variables'
      });
    }

    // List available models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);

    const models = response.data.models || [];
    const availableModels = models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => ({
        name: m.name,
        displayName: m.displayName,
        description: m.description
      }));

    res.status(200).json({
      success: true,
      models: availableModels,
      total: availableModels.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Diagnostic endpoint to test Gemini API
app.get('/api/ai/test', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not set in Railway environment variables',
        help: 'Go to Railway → Variables → Add GEMINI_API_KEY'
      });
    }

    // First, list available models
    let availableModels = [];
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listResponse = await axios.get(listUrl);
      availableModels = (listResponse.data.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
    } catch (e) {
      console.log('Could not list models:', e.message);
    }

    // Test with a simple prompt
    const testPrompt = 'Say "Hello" in one word.';
    const testResult = await callGeminiAPI(testPrompt, { temperature: 0.7 });

    res.status(200).json({
      success: true,
      message: 'Gemini API is working!',
      modelUsed: testResult.modelName,
      testResponse: testResult.text,
      apiKeySet: true,
      availableModels: availableModels,
      apiKeyPreview: apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      apiKeySet: !!process.env.GEMINI_API_KEY,
      help: 'Check Railway logs for detailed error messages. Try /api/ai/list-models to see available models.'
    });
  }
});

// --- USER PHOTO UPDATE ---
app.put('/api/user/:userId/photo', async (req, res) => {
  const { userId } = req.params;
  const { photo } = req.body; // Expecting base64 string or URL

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Validate photo input
    if (!photo || typeof photo !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid photo data' });
    }

    // If it's a base64 image, validate size (max 1MB to prevent database bloat)
    if (photo.startsWith('data:image')) {
      const base64Data = photo.split(',')[1] || photo;
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSizeInBytes = 1024 * 1024; // 1MB

      if (sizeInBytes > maxSizeInBytes) {
        return res.status(400).json({
          success: false,
          message: 'Image too large. Please use an image smaller than 1MB.'
        });
      }
    }

    // Update user picture
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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@2003';

// GET ALL USERS
app.get('/api/admin/users', async (req, res) => {
  const { adminPassword } = req.query;
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin password' });
  }

  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'is_premium', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// DELETE USER
app.delete('/api/admin/users/:id', async (req, res) => {
  const { adminPassword } = req.query;
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin password' });
  }

  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

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
    const user = await User.findByPk(request.user_id);
    if (user) {
      user.is_premium = true;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30); // 30 Days
      user.premium_expires_at = expiry;
      await user.save();

      // Send Activation Email
      const expiryFormatted = expiry.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #e11d48; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Pro Plan Activated!</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hi ${user.name || 'User'},</p>
            <p>Great news! Your payment has been approved and your <strong>Pro Plan</strong> is now active.</p>
            <div style="background-color: #fce7f3; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #e11d48; font-weight: bold;">Expiration Date: ${expiryFormatted}</p>
            </div>
            <p>You now have unlimited access to our AI humanizer and detection tools.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p style="margin-top: 30px;">Best regards,<br>The MinihaAI Team</p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; 2026 MinihaAI. All rights reserved.
          </div>
        </div>
      `;

      sendEmail(user.email, 'Pro Plan Activated - MinihaAI', emailHtml)
        .catch(err => console.error("Activation email failed:", err));
    }

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

    // Check expiration
    await checkAndUpdatePremiumExpiration(user);

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

// DELETE USER
app.delete('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user
    await user.destroy();

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ success: false, message: "Error deleting account" });
  }
});

// Only start server when running directly (not in Vercel serverless)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;

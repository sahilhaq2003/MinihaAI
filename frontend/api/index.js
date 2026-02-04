/**
 * Vercel Serverless Function - Complete API Handler for MinihaAI
 * Handles all /api/* routes including Auth, User, Payment, Admin, and AI
 */

const { Sequelize, DataTypes, Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const axios = require('axios');

// --- DATABASE CONNECTION (AWS RDS / MySQL) ---
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'minihaai';

let sequelize = null;
let modelsCache = null;

const getSequelize = () => {
    if (!sequelize) {
        if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
            throw new Error('Database credentials not configured. Please set DB_HOST, DB_USER, DB_PASSWORD in Vercel environment variables.');
        }
        sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
            host: DB_HOST,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        });
    }
    return sequelize;
};

// --- DATA MODELS ---
const getModels = () => {
    if (modelsCache) return modelsCache;

    const seq = getSequelize();

    const User = seq.define('User', {
        id: { type: DataTypes.STRING, primaryKey: true },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        picture: { type: DataTypes.TEXT('medium') },
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

    const Transaction = seq.define('Transaction', {
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

    const PaymentRequest = seq.define('PaymentRequest', {
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

    const IPTracking = seq.define('IPTracking', {
        ip_address: { type: DataTypes.STRING, primaryKey: true },
        account_count: { type: DataTypes.INTEGER, defaultValue: 0 },
        last_account_created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        timestamps: false,
        tableName: 'ip_tracking'
    });

    modelsCache = { User, Transaction, PaymentRequest, IPTracking };
    return modelsCache;
};

// --- EMAIL SERVICE ---
const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️ Email not configured.');
            return { success: false, message: 'Email service not configured' };
        }

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

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

// Helper function to check and update expired premium status
const checkAndUpdatePremiumExpiration = async (user) => {
    if (!user || !user.is_premium) return user;
    if (user.premium_expires_at && new Date() > new Date(user.premium_expires_at)) {
        user.is_premium = false;
        user.premium_expires_at = null;
        await user.save();
    }
    return user;
};

// Get client IP
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    return 'unknown';
};

// --- GEMINI AI API ---
const callGeminiAPI = async (prompt, config = {}) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    const errors = [];

    for (const modelName of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const response = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: config.temperature || 0.9,
                    topP: config.topP || 0.95,
                    topK: config.topK || 40,
                    maxOutputTokens: config.maxOutputTokens || 8192,
                    ...(config.responseMimeType && { responseMimeType: config.responseMimeType })
                }
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 55000
            });

            const data = response.data;
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return {
                    text: data.candidates[0].content.parts[0].text,
                    modelName
                };
            }
        } catch (error) {
            errors.push(`${modelName}: ${error.message}`);
            continue;
        }
    }

    throw new Error(`All Gemini models failed. Errors: ${errors.join('; ')}`);
};

// Text processing helpers
const postprocessText = (text) => {
    let result = text.trim();
    result = result.replace(/\(\d+\s*words?\)/gi, '');
    result = result.replace(/word\s*count:?\s*\d+/gi, '');
    result = result.replace(/```[\s\S]*?```/g, '');
    result = result.replace(/`([^`]+)`/g, '$1');
    result = result.replace(/\*\*/g, '');
    result = result.replace(/\*/g, '');
    result = result.replace(/__/g, '');
    result = result.replace(/_/g, '');
    result = result.replace(/#{1,6}\s/g, '');
    result = result.replace(/\n{3,}/g, '\n\n');
    result = result.replace(/\s{2,}/g, ' ');
    return result.trim();
};

// --- CORS Headers ---
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
};

// --- MAIN HANDLER ---
module.exports = async function handler(req, res) {
    setCorsHeaders(res);

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url, method, body } = req;
    const path = url.replace('/api', '').split('?')[0];

    try {
        const { User, Transaction, PaymentRequest, IPTracking } = getModels();

        // ========== HEALTH CHECK ==========
        if (path === '/' || path === '' || path === '/health') {
            try {
                await getSequelize().authenticate();
                return res.status(200).json({
                    status: 'healthy',
                    database: 'connected',
                    message: 'MinihaAI API is running on Vercel!'
                });
            } catch (error) {
                return res.status(200).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
            }
        }

        // ========== AUTH ROUTES ==========

        // SIGNUP
        if (path === '/auth/signup' && method === 'POST') {
            const { email, password } = body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date();
            otpExpires.setMinutes(otpExpires.getMinutes() + 15);

            const user = await User.create({
                id: uuidv4(),
                email,
                password: hashedPassword,
                name: email.split('@')[0],
                picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
                provider: 'email',
                is_premium: false,
                email_verified: false,
                otp_code: otpCode,
                otp_expires: otpExpires,
                created_at: new Date()
            });

            // Send OTP Email
            const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #e11d48; text-align: center;">Verify Your Account</h2>
          <p>Hi ${user.name},</p>
          <p>Thank you for signing up for MinihaAI. Please use the following OTP to verify your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #fce7f3; color: #e11d48; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px; border: 1px dashed #e11d48;">${otpCode}</span>
          </div>
          <p>This code will expire in 15 minutes.</p>
        </div>
      `;
            sendEmail(email, 'Your MinihaAI Verification Code', emailHtml).catch(console.error);

            return res.status(201).json({
                success: true,
                message: 'Account created! Please check your email for the OTP.',
                requiresOtp: true,
                email: user.email
            });
        }

        // VERIFY OTP
        if (path === '/auth/verify-otp' && method === 'POST') {
            const { email, otpCode } = body;
            const user = await User.findOne({ where: { email } });

            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            if (user.email_verified) {
                return res.json({
                    success: true,
                    message: 'Email already verified',
                    user: { id: user.id, name: user.name, email: user.email, avatar: user.picture, isPremium: user.is_premium }
                });
            }
            if (user.otp_code !== otpCode) return res.status(400).json({ success: false, message: 'Invalid OTP' });
            if (new Date() > new Date(user.otp_expires)) return res.status(400).json({ success: false, message: 'OTP expired' });

            user.email_verified = true;
            user.otp_code = null;
            user.otp_expires = null;
            await user.save();

            return res.json({
                success: true,
                message: 'Email verified successfully!',
                user: { id: user.id, name: user.name, email: user.email, avatar: user.picture, isPremium: user.is_premium }
            });
        }

        // LOGIN
        if (path === '/auth/login' && method === 'POST') {
            const { email, password } = body;
            const user = await User.findOne({ where: { email } });

            if (!user) return res.status(400).json({ success: false, message: 'User not found' });

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) return res.status(400).json({ success: false, message: 'Invalid credentials' });

            await checkAndUpdatePremiumExpiration(user);

            return res.status(200).json({
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
        }

        // CHANGE PASSWORD
        if (path === '/auth/change-password' && method === 'POST') {
            const { userId, currentPassword, newPassword } = body;

            if (!userId || !currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }

            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            return res.status(200).json({ success: true, message: 'Password changed successfully' });
        }

        // FORGOT PASSWORD
        if (path === '/auth/forgot-password' && method === 'POST') {
            const { email } = body;
            const user = await User.findOne({ where: { email } });

            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

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
          <p>Use this code to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #fce7f3; color: #e11d48; padding: 12px 24px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px;">${otpCode}</span>
          </div>
          <p>This code expires in 15 minutes.</p>
        </div>
      `;
            sendEmail(email, 'Reset Password Code', emailHtml).catch(console.error);

            return res.json({ success: true, message: 'OTP sent to email' });
        }

        // RESET PASSWORD
        if (path === '/auth/reset-password' && method === 'POST') {
            const { email, otp, newPassword } = body;
            const user = await User.findOne({ where: { email } });

            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            if (user.otp_code !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
            if (new Date() > new Date(user.otp_expires)) return res.status(400).json({ success: false, message: 'OTP expired' });

            user.password = await bcrypt.hash(newPassword, 10);
            user.otp_code = null;
            user.otp_expires = null;
            await user.save();

            return res.json({ success: true, message: 'Password reset successful' });
        }

        // ========== USER ROUTES ==========

        // GET USER
        if (path.match(/^\/user\/[^/]+$/) && method === 'GET') {
            const userId = path.split('/')[2];
            const user = await User.findByPk(userId);

            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            await checkAndUpdatePremiumExpiration(user);

            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.picture,
                    isPremium: user.is_premium,
                    mobileNumber: user.mobile_number
                }
            });
        }

        // UPDATE USER
        if (path.match(/^\/user\/[^/]+$/) && method === 'PUT') {
            const userId = path.split('/')[2];
            const { name, picture, mobileNumber } = body;

            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            if (name) user.name = name;
            if (picture) user.picture = picture;
            if (mobileNumber !== undefined) user.mobile_number = mobileNumber;
            await user.save();

            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.picture,
                    isPremium: user.is_premium,
                    mobileNumber: user.mobile_number
                }
            });
        }

        // UPDATE PHOTO
        if (path.match(/^\/user\/[^/]+\/photo$/) && method === 'PUT') {
            const userId = path.split('/')[2];
            const { photo } = body;

            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            user.picture = photo;
            await user.save();

            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.picture,
                    isPremium: user.is_premium
                }
            });
        }

        // DELETE USER
        if (path.match(/^\/user\/[^/]+$/) && method === 'DELETE') {
            const userId = path.split('/')[2];
            const user = await User.findByPk(userId);

            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            await Transaction.destroy({ where: { user_id: userId } });
            await PaymentRequest.destroy({ where: { user_id: userId } });
            await user.destroy();

            return res.json({ success: true, message: 'Account deleted successfully' });
        }

        // GET TRANSACTIONS
        if (path.match(/^\/user\/[^/]+\/transactions$/) && method === 'GET') {
            const userId = path.split('/')[2];
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

            return res.status(200).json({ success: true, transactions: formatted });
        }

        // ========== PAYMENT ROUTES ==========

        // SUBMIT PAYMENT REQUEST
        if (path === '/payment/request' && method === 'POST') {
            const { userId, userEmail, userName, amount, paymentId, paymentReceipt } = body;

            const existingRequest = await PaymentRequest.findOne({
                where: { user_id: userId, status: 'pending' }
            });

            if (existingRequest) {
                return res.status(400).json({ success: false, message: 'You already have a pending request.' });
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

            return res.status(201).json({ success: true, request });
        }

        // CHECK PAYMENT STATUS
        if (path.match(/^\/payment\/status\/[^/]+$/) && method === 'GET') {
            const userId = path.split('/')[3];
            const user = await User.findByPk(userId);
            const pendingRequest = await PaymentRequest.findOne({
                where: { user_id: userId, status: 'pending' }
            });

            return res.json({
                success: true,
                isPremium: user?.is_premium || false,
                hasPending: !!pendingRequest,
                paymentRequest: pendingRequest
            });
        }

        // ========== ADMIN ROUTES ==========

        // ADMIN LOGIN
        if (path === '/admin/login' && method === 'POST') {
            const { password } = body;
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin@2003';

            if (password === adminPassword) {
                return res.json({ success: true, message: 'Admin authenticated' });
            }
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // GET ALL USERS
        if (path === '/admin/users' && method === 'GET') {
            const users = await User.findAll({ order: [['created_at', 'DESC']] });
            return res.json({ success: true, users });
        }

        // GET ALL PAYMENT REQUESTS
        if (path === '/admin/payment-requests' && method === 'GET') {
            const requests = await PaymentRequest.findAll({ order: [['submitted_at', 'DESC']] });
            return res.json({ success: true, requests });
        }

        // APPROVE/REJECT PAYMENT
        if (path.match(/^\/admin\/payment\/[^/]+\/(approve|reject)$/) && method === 'POST') {
            const parts = path.split('/');
            const requestId = parts[3];
            const action = parts[4];
            const { adminNotes } = body;

            const request = await PaymentRequest.findByPk(requestId);
            if (!request) return res.status(404).json({ success: false, message: 'Payment request not found' });

            request.status = action === 'approve' ? 'approved' : 'rejected';
            request.admin_notes = adminNotes;
            request.reviewed_at = new Date();
            await request.save();

            if (action === 'approve') {
                const user = await User.findByPk(request.user_id);
                if (user) {
                    user.is_premium = true;
                    const expiry = new Date();
                    expiry.setDate(expiry.getDate() + 30);
                    user.premium_expires_at = expiry;
                    await user.save();

                    await Transaction.create({
                        id: uuidv4(),
                        user_id: user.id,
                        amount: request.amount,
                        status: 'Paid',
                        date: new Date(),
                        invoice_id: '#INV-' + Math.floor(Math.random() * 1000000),
                        plan_type: 'Pro Plan',
                        payment_method: 'manual'
                    });

                    // Send approval email
                    const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">🎉 Pro Plan Activated!</h2>
              <p>Hi ${user.name},</p>
              <p>Your payment has been verified and your Pro Plan is now active!</p>
            </div>
          `;
                    sendEmail(user.email, 'Your MinihaAI Pro Plan is Active!', emailHtml).catch(console.error);
                }
            }

            return res.json({ success: true, message: `Payment ${action}d successfully` });
        }

        // ========== AI ROUTES ==========

        // AI TEST
        if (path === '/ai/test' && method === 'GET') {
            try {
                const result = await callGeminiAPI('Say hello in one word.', { temperature: 0.7 });
                return res.json({ success: true, message: 'Gemini API working!', response: result.text, model: result.modelName });
            } catch (error) {
                return res.status(500).json({ success: false, error: error.message });
            }
        }

        // HUMANIZE TEXT
        if (path === '/ai/humanize' && method === 'POST') {
            const { text, tone = 'Standard', vocabulary = 'Standard (College)', intensity = 50 } = body;

            if (!text || !text.trim()) {
                return res.status(400).json({ success: false, message: 'Text is required' });
            }

            const originalWordCount = text.split(/\s+/).filter(w => w.length > 0).length;
            const maxWords = Math.ceil(originalWordCount * 1.05);

            const prompt = `You are a master humanizer. Rewrite this text to sound 100% human-written while keeping the same meaning. 

SETTINGS:
- Tone: ${tone}
- Vocabulary: ${vocabulary}  
- Intensity: ${intensity}% (higher = more human imperfections)

RULES:
1. Keep word count similar (max ${maxWords} words)
2. NEVER use: "Moreover", "Furthermore", "Additionally", "Consequently", "Ultimately"
3. USE instead: "Plus", "Also", "And", "But", "So", "Actually"
4. Add natural contractions (don't, can't, won't)
5. Vary sentence lengths dramatically
6. Add human touches: "I think", "maybe", "sort of", "you know"
7. NO bullet points, NO markdown
8. Plain text only

TEXT TO HUMANIZE:
"${text}"

Output ONLY the rewritten text, nothing else.`;

            const result = await callGeminiAPI(prompt, { temperature: 0.95 + (intensity / 1000) });
            const humanizedText = postprocessText(result.text || text);

            return res.json({ success: true, text: humanizedText });
        }

        // DETECT AI
        if (path === '/ai/detect' && method === 'POST') {
            const { text } = body;

            if (!text || !text.trim()) {
                return res.status(400).json({ success: false, message: 'Text is required' });
            }

            const prompt = `Analyze this text to determine if it was written by AI or a human.

TEXT: "${text.substring(0, 5000)}"

Provide JSON response:
{
  "score": 0-100 (0=human, 100=AI),
  "label": "Human-Written" | "Mixed/Edited" | "Fully AI-Generated",
  "analysis": "Brief explanation"
}`;

            const result = await callGeminiAPI(prompt, { responseMimeType: 'application/json', temperature: 0.3 });

            let detection;
            try {
                let cleanedText = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                detection = JSON.parse(cleanedText);
            } catch (e) {
                detection = { score: 50, label: 'Unknown', analysis: 'Could not analyze' };
            }

            return res.json({ success: true, ...detection });
        }

        // ========== 404 ==========
        return res.status(404).json({ success: false, message: 'API route not found', path });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

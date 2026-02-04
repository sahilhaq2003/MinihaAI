// Minimal Vercel Serverless Function for Express
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'MinihaAI Backend is running!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'API is working!',
        env: {
            hasDBHost: !!process.env.DB_HOST,
            hasDBUser: !!process.env.DB_USER,
            hasDBPassword: !!process.env.DB_PASSWORD,
            hasGeminiKey: !!process.env.GEMINI_API_KEY
        }
    });
});

// Import and use the main app for all other routes
const mainApp = require('../server.js');

// Forward all other routes to main app
app.use((req, res, next) => {
    mainApp(req, res, next);
});

module.exports = app;

// Vercel Serverless Function Handler
const app = require('../server.js');
const { Sequelize } = require('sequelize');

// Initialize database connection for serverless
let dbInitialized = false;

const initDB = async () => {
    if (dbInitialized) return;

    const DB_HOST = process.env.DB_HOST;
    const DB_USER = process.env.DB_USER;
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_NAME = process.env.DB_NAME || 'minihaai';

    if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
        console.error('Database credentials missing!');
        return;
    }

    try {
        const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
            host: DB_HOST,
            dialect: 'mysql',
            logging: false,
            pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
            dialectOptions: {
                ssl: { require: true, rejectUnauthorized: false }
            }
        });

        await sequelize.authenticate();
        await sequelize.sync();
        dbInitialized = true;
        console.log('DB connected for serverless');
    } catch (error) {
        console.error('DB connection error:', error.message);
    }
};

// Middleware to ensure DB is connected
module.exports = async (req, res) => {
    await initDB();
    return app(req, res);
};

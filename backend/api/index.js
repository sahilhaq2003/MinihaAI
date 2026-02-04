// Vercel Serverless Function Handler
// Explicitly require mysql2 before server to ensure it's bundled
require('mysql2');

const app = require('../server.js');

module.exports = app;

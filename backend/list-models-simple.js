
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function list() {
    try {
        const response = await axios.get(URL);
        const models = response.data.models.map(m => m.name);
        console.log("Available Models:", models);
    } catch (error) {
        console.error("Error Status:", error.response?.status);
    }
}

list();

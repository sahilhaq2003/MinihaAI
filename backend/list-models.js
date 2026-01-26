
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function list() {
    try {
        const response = await axios.get(URL);
        console.log("Models:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error Status:", error.response?.status);
        console.error("Error Data:", JSON.stringify(error.response?.data, null, 2));
    }
}

list();

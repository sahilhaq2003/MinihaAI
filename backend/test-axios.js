
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-1.5-flash';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function test() {
    try {
        const response = await axios.post(URL, {
            contents: [{ parts: [{ text: "Hello" }] }]
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error Status:", error.response?.status);
        console.error("Error Data:", JSON.stringify(error.response?.data, null, 2));
    }
}

test();

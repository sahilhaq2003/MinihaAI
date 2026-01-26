const net = require('net');
require('dotenv').config();

const host = process.env.DB_HOST;
const port = 3306;

console.log(`🔍 Testing network connectivity to ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(5000); // 5 second timeout

socket.on('connect', () => {
    console.log('✅ SUCCESS: TCP Connection established!');
    console.log('   This means your computer CAN reach the AWS RDS instance.');
    console.log('   If the app still fails, check your DB_USER and DB_PASSWORD.');
    socket.destroy();
});

socket.on('timeout', () => {
    console.log('❌ TIMEOUT: Connection timed out.');
    console.log('   This means a FIREWALL is blocking the connection.');
    console.log('   Likely cause: AWS Security Group does not allow your IP.');
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`❌ ERROR: ${err.message}`);
    if (err.code === 'ENOTFOUND') {
        console.log('   DNS Error: The endpoint URL is incorrect.');
    }
    socket.destroy();
});

socket.connect(port, host);

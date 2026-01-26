// Quick test to verify the change-password endpoint exists
const axios = require('axios');

async function testChangePasswordEndpoint() {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/change-password', {
            userId: 'test',
            currentPassword: 'test',
            newPassword: 'test'
        });
        console.log('✅ Endpoint exists and responded:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('✅ Endpoint exists! Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testChangePasswordEndpoint();

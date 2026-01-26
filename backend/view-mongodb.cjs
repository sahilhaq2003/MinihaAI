require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahilhaq2003:Sahil%402003Haq@cluster0.buir1zc.mongodb.net/minihaai?retryWrites=true&w=majority';

// Schemas
const userSchema = new mongoose.Schema({
  id: String, email: String, password: String, name: String,
  picture: String, provider: String, is_premium: Boolean,
  created_at: Date
});

const transactionSchema = new mongoose.Schema({
  id: String, user_id: String, amount: String, status: String,
  date: Date, invoice_id: String, plan_type: String
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

async function viewDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\n📊 DATABASE: MongoDB Atlas (minihaai)\n');
    console.log('='.repeat(60));

    // Show users
    const users = await User.find({});
    console.log('\n👥 USERS COLLECTION:', users.length, 'user(s)');
    console.log('-'.repeat(60));
    
    if (users.length === 0) {
      console.log('   (No users yet)');
    } else {
      users.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.email}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Name: ${user.name}`);
        console.log(`      Provider: ${user.provider}`);
        console.log(`      Premium: ${user.is_premium ? 'YES ⭐' : 'No'}`);
        console.log(`      Created: ${user.created_at}`);
        console.log('');
      });
    }

    // Show transactions
    const transactions = await Transaction.find({});
    console.log('\n💳 TRANSACTIONS COLLECTION:', transactions.length, 'transaction(s)');
    console.log('-'.repeat(60));
    
    if (transactions.length === 0) {
      console.log('   (No transactions yet)');
    } else {
      transactions.forEach((tx, i) => {
        console.log(`   ${i+1}. Invoice: ${tx.invoice_id}`);
        console.log(`      Amount: ${tx.amount}`);
        console.log(`      Status: ${tx.status}`);
        console.log(`      Date: ${tx.date}`);
        console.log('');
      });
    }

    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

viewDatabase();




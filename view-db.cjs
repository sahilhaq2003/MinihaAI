const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'miniha.db');
const db = new sqlite3.Database(dbPath);

console.log('\n📊 DATABASE: miniha.db\n');
console.log('=' .repeat(60));

// Show all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('\n📁 TABLES:', tables.map(t => t.name).join(', '));
    console.log('=' .repeat(60));
    
    // Show users
    console.log('\n👥 USERS TABLE:');
    console.log('-'.repeat(60));
    db.all("SELECT id, email, name, provider, is_premium, created_at FROM users", [], (err, users) => {
        if (err) {
            console.error('Error:', err);
        } else if (users.length === 0) {
            console.log('   (No users yet - sign up to create one!)');
        } else {
            users.forEach((user, i) => {
                console.log(`   ${i+1}. ${user.email}`);
                console.log(`      Name: ${user.name}`);
                console.log(`      Provider: ${user.provider}`);
                console.log(`      Premium: ${user.is_premium ? 'YES ⭐' : 'No'}`);
                console.log(`      Created: ${user.created_at}`);
                console.log('');
            });
        }
        
        // Show transactions
        console.log('\n💳 TRANSACTIONS TABLE:');
        console.log('-'.repeat(60));
        db.all("SELECT * FROM transactions", [], (err, txs) => {
            if (err) {
                console.error('Error:', err);
            } else if (txs.length === 0) {
                console.log('   (No transactions yet)');
            } else {
                txs.forEach((tx, i) => {
                    console.log(`   ${i+1}. Invoice: ${tx.invoice_id}`);
                    console.log(`      Amount: ${tx.amount}`);
                    console.log(`      Status: ${tx.status}`);
                    console.log(`      Date: ${tx.date}`);
                    console.log('');
                });
            }
            
            console.log('\n' + '='.repeat(60));
            db.close();
        });
    });
});


require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');

async function seedDatabase() {
  const db = getDb();

  console.log('Seeding database with demo users...');

  // Demo users
  const demoUsers = [
    {
      username: 'demo',
      email: 'demo@example.com',
      password: 'demo123'
    },
    {
      username: 'alice',
      email: 'alice@example.com',
      password: 'alice123'
    },
    {
      username: 'bob',
      email: 'bob@example.com',
      password: 'bob123'
    }
  ];

  db.serialize(async () => {
    for (const user of demoUsers) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [user.username, user.email, hashedPassword],
          function (err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                console.log(`User ${user.username} already exists, skipping...`);
              } else {
                console.error(`Error creating user ${user.username}:`, err);
              }
              return;
            }

            const userId = this.lastID;
            console.log(`Created user: ${user.username} (ID: ${userId})`);

            // Create checking account
            db.run(
              'INSERT INTO accounts (user_id, account_name, account_type, balance) VALUES (?, ?, ?, ?)',
              [userId, 'Checking Account', 'checking', 5000],
              function (err) {
                if (err) {
                  console.error('Error creating checking account:', err);
                } else {
                  console.log(`  - Created Checking Account (ID: ${this.lastID}) with $5,000`);
                }
              }
            );

            // Create savings account
            db.run(
              'INSERT INTO accounts (user_id, account_name, account_type, balance) VALUES (?, ?, ?, ?)',
              [userId, 'Savings Account', 'savings', 10000],
              function (err) {
                if (err) {
                  console.error('Error creating savings account:', err);
                } else {
                  console.log(`  - Created Savings Account (ID: ${this.lastID}) with $10,000`);
                }
              }
            );
          }
        );
      } catch (error) {
        console.error('Error hashing password:', error);
      }
    }

    // Close the database after a delay to ensure all operations complete
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('\nDatabase seeding complete!');
          console.log('\nDemo Users:');
          demoUsers.forEach(user => {
            console.log(`  Username: ${user.username}, Password: ${user.password}`);
          });
        }
      });
    }, 1000);
  });
}

seedDatabase();


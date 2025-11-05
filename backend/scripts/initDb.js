require('dotenv').config();
const { initializeDatabase } = require('../config/database');

console.log('Initializing database...');
initializeDatabase();
console.log('Database initialization complete!');


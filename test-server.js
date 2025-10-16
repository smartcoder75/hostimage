// Simple test to check if server can start
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

console.log('Testing server configuration...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Test MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connection successful!');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });

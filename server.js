const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const imageRoutes = require('./src/routes/imageRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder to serve the project root (so index.html, style.css, image/, and public/ are reachable)
app.use(express.static(path.join(__dirname)));
// Ensure uploads directory exists and serve it correctly
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at', uploadsDir);
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);

// Serve index.html at root in development so GET / returns the main page
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
  });
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

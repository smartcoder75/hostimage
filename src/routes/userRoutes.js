const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  registerUser, 
  loginUser, 
  getUserProfile 
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router;

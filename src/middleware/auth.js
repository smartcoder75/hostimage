const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Log = require('../models/logModel');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

const logAction = async (req, res, next) => {
  // Only log if user is authenticated
  if (!req.user) {
    return next();
  }
  
  const action = req.method + ' ' + req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || '';
  
  try {
    await Log.create({
      user: req.user._id,
      action: req.method,
      details: action,
      ipAddress: ip,
      userAgent: userAgent
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
  
  next();
};

module.exports = { protect, admin, logAction };

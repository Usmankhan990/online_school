const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'usman_online_school_jwt_secret_2026_very_secure'
    );
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    if (user.status !== 'active' && user.status !== 'trial') {
      return res.status(403).json({ error: `Account is ${user.status}. Contact admin.` });
    }
    
    // Check trial expiration
    if (user.status === 'trial') {
      const trialDuration = 3 * 24 * 60 * 60 * 1000;
      if (new Date() - new Date(user.createdAt) > trialDuration) {
        return res.status(401).json({ error: 'Your 3-day free trial has expired. Contact admin.' });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// Role-based access
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };

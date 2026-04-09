const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running smoothly',
  });
});

// Auth routes
const authRoutes = require('./auth');
router.use('/auth', authRoutes);

module.exports = router;

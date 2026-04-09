const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running smoothly',
  });
});

// TODO: Import and use module routers here
// Example: 
// const authRoutes = require('./auth');
// router.use('/auth', authRoutes);

module.exports = router;

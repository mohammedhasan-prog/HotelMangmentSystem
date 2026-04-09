const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const hotelRoutes = require('./hotels');
const roomRoutes = require('./rooms');
const bookingRoutes = require('./bookings');
const promotionRoutes = require('./promotions');
const adminRoutes = require('./admin');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running smoothly',
  });
});

router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/promotions', promotionRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

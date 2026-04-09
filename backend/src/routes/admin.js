const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/hotels', adminController.getHotels);
router.get('/bookings/recent', adminController.getRecentBookings);
router.get('/bookings', adminController.getBookingsDashboard);
router.get('/analytics', adminController.getAnalyticsDashboard);

/**
 * @swagger
 * /admin/hotels:
 *   post:
 *     summary: Create a hotel (Admin)
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Hotel created
 */
router.post('/hotels', adminController.createHotel);
router.patch('/hotels/:id', adminController.updateHotel);
router.delete('/hotels/:id', adminController.deleteHotel);

/**
 * @swagger
 * /admin/rooms/{id}:
 *   patch:
 *     summary: Update room details (Admin)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room updated
 */
router.patch('/rooms/:id', adminController.updateRoom);

module.exports = router;

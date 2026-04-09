const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', bookingController.createBooking);

/**
 * @swagger
 * /bookings/history:
 *   get:
 *     summary: Get logged-in user's booking history
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Booking history
 */
router.get('/history', bookingController.getBookingHistory);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.patch('/:id/cancel', bookingController.cancelBooking);

/**
 * @swagger
 * /bookings/{id}/rebook:
 *   post:
 *     summary: Rebook from a previous booking using new dates
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Rebooking created
 */
router.post('/:id/rebook', bookingController.rebook);

module.exports = router;

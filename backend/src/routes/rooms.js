const express = require('express');
const roomController = require('../controllers/roomController');

const router = express.Router();

/**
 * @swagger
 * /rooms/availability:
 *   get:
 *     summary: Get available rooms for a date range
 *     tags: [Rooms]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: checkInDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: checkOutDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: city
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: hotelId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: guests
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Available rooms
 */
router.get('/availability', roomController.getAvailability);

module.exports = router;

const express = require('express');
const hotelController = require('../controllers/hotelController');

const router = express.Router();

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     security: []
 *     responses:
 *       200:
 *         description: List of hotels
 */
router.get('/', hotelController.getHotels);

/**
 * @swagger
 * /hotels/{id}:
 *   get:
 *     summary: Get hotel details by id
 *     tags: [Hotels]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hotel details
 *       404:
 *         description: Hotel not found
 */
router.get('/:id', hotelController.getHotelById);

module.exports = router;

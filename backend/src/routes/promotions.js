const express = require('express');
const promotionController = require('../controllers/promotionController');

const router = express.Router();

/**
 * @swagger
 * /promotions/apply:
 *   post:
 *     summary: Apply a promotion code to an amount
 *     tags: [Promotions]
 *     security: []
 *     responses:
 *       200:
 *         description: Promotion applied
 */
router.post('/apply', promotionController.applyPromotion);

module.exports = router;

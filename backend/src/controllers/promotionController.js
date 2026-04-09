const prisma = require('../config/prisma');

exports.applyPromotion = async (req, res, next) => {
  try {
    const { code, amount } = req.body;

    if (!code || typeof amount !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'code and numeric amount are required.',
      });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { code },
    });

    if (!promotion || !promotion.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or inactive promotion code.',
      });
    }

    const now = new Date();
    if (now < promotion.validFrom || now > promotion.validUntil) {
      return res.status(400).json({
        status: 'error',
        message: 'Promotion code is expired or not active yet.',
      });
    }

    const discountAmount = (amount * promotion.discountPercent) / 100;
    const finalAmount = Math.max(0, amount - discountAmount);

    res.status(200).json({
      status: 'success',
      data: {
        code: promotion.code,
        discountPercent: promotion.discountPercent,
        amount,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

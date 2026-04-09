const prisma = require('../config/prisma');

exports.getActivePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      select: {
        id: true,
        code: true,
        discountPercent: true,
        validUntil: true,
      },
      orderBy: [
        { discountPercent: 'desc' },
        { code: 'asc' },
      ],
      take: 8,
    });

    res.status(200).json({
      status: 'success',
      results: promotions.length,
      data: { promotions },
    });
  } catch (error) {
    next(error);
  }
};

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

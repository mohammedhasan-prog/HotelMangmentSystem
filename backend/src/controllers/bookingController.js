const prisma = require('../config/prisma');

const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED'];

const toReservationCode = () => `RES-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

exports.createBooking = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests, promotionCode } = req.body;

    if (!roomId || !checkInDate || !checkOutDate || !guests) {
      return res.status(400).json({
        status: 'error',
        message: 'roomId, checkInDate, checkOutDate, and guests are required.',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      return res.status(400).json({
        status: 'error',
        message: 'Provide valid date range where checkOutDate is after checkInDate.',
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: { hotel: true },
      });

      if (!room) {
        const err = new Error('Room not found.');
        err.statusCode = 404;
        throw err;
      }

      if (Number(guests) > room.capacity) {
        const err = new Error('Selected room capacity is less than number of guests.');
        err.statusCode = 400;
        throw err;
      }

      const overlap = await tx.booking.findFirst({
        where: {
          roomId,
          status: { in: ACTIVE_BOOKING_STATUSES },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      });

      if (overlap) {
        const err = new Error('Room is already booked for the selected date range.');
        err.statusCode = 409;
        throw err;
      }

      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      let totalAmount = room.price * nights;
      let promotionId = null;

      if (promotionCode) {
        const promotion = await tx.promotion.findUnique({ where: { code: promotionCode } });
        const now = new Date();

        if (!promotion || !promotion.isActive || now < promotion.validFrom || now > promotion.validUntil) {
          const err = new Error('Invalid or expired promotion code.');
          err.statusCode = 400;
          throw err;
        }

        promotionId = promotion.id;
        totalAmount = Math.max(0, totalAmount - (totalAmount * promotion.discountPercent) / 100);
      }

      const newBooking = await tx.booking.create({
        data: {
          reservationNum: toReservationCode(),
          userId: req.user.id,
          hotelId: room.hotelId,
          roomId: room.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests: Number(guests),
          totalAmount,
          status: 'CONFIRMED',
          promotionId,
        },
        include: {
          hotel: true,
          room: true,
          promotion: true,
        },
      });

      return newBooking;
    });

    res.status(201).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingHistory = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        hotel: true,
        room: true,
        promotion: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found.',
      });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only cancel your own bookings.',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking is already cancelled.',
      });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully.',
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
};

exports.rebook = async (req, res, next) => {
  try {
    const original = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        room: true,
      },
    });

    if (!original) {
      return res.status(404).json({
        status: 'error',
        message: 'Original booking not found.',
      });
    }

    if (original.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only rebook your own booking.',
      });
    }

    req.body.roomId = original.roomId;
    req.body.guests = req.body.guests || original.guests;

    return exports.createBooking(req, res, next);
  } catch (error) {
    next(error);
  }
};

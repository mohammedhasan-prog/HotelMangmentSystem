const prisma = require('../config/prisma');

const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED'];

const parseAmenities = (raw) => {
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate, city, hotelId, guests } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        status: 'error',
        message: 'checkInDate and checkOutDate are required.',
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

    const roomWhere = {
      ...(guests ? { capacity: { gte: Number(guests) } } : {}),
      ...(hotelId ? { hotelId } : {}),
      ...(city
        ? {
            hotel: {
              city: {
                contains: city,
              },
            },
          }
        : {}),
      bookings: {
        none: {
          status: { in: ACTIVE_BOOKING_STATUSES },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      },
    };

    const rooms = await prisma.room.findMany({
      where: roomWhere,
      include: {
        hotel: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: rooms.length,
      data: {
        rooms: rooms.map((room) => ({
          ...room,
          amenities: parseAmenities(room.amenities),
          hotel: {
            ...room.hotel,
            amenities: parseAmenities(room.hotel.amenities),
          },
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

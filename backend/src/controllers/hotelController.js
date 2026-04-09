const prisma = require('../config/prisma');

const parseAmenities = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const parsePhotos = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

exports.getHotels = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (req.query.city) {
      where.city = { contains: req.query.city };
    }

    if (req.query.location) {
      where.location = { contains: req.query.location };
    }

    const hotels = await prisma.hotel.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        rooms: {
          select: {
            id: true,
            type: true,
            price: true,
            capacity: true,
          },
        },
      },
    });

    const total = await prisma.hotel.count({ where });

    res.status(200).json({
      status: 'success',
      results: hotels.length,
      pagination: {
        page,
        limit,
        total,
      },
      data: {
        hotels: hotels.map((hotel) => ({
          ...hotel,
          amenities: parseAmenities(hotel.amenities),
          photos: parsePhotos(hotel.photos),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      include: {
        rooms: true,
      },
    });

    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        hotel: {
          ...hotel,
          amenities: parseAmenities(hotel.amenities),
          photos: parsePhotos(hotel.photos),
          rooms: hotel.rooms.map((room) => ({
            ...room,
            amenities: parseAmenities(room.amenities),
            photos: parsePhotos(room.photos),
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

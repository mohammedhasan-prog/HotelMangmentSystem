const prisma = require('../config/prisma');

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string' && value.trim().startsWith('[')) return value;
  if (typeof value === 'string' && value.trim()) {
    return JSON.stringify(value.split(',').map((item) => item.trim()).filter(Boolean));
  }

  return JSON.stringify([]);
};

exports.createHotel = async (req, res, next) => {
  try {
    const { name, city, location, description, rating, amenities } = req.body;

    if (!name || !city || !location) {
      return res.status(400).json({
        status: 'error',
        message: 'name, city, and location are required.',
      });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        city,
        location,
        description,
        rating: rating ?? 0,
        amenities: normalizeAmenities(amenities),
      },
    });

    res.status(201).json({
      status: 'success',
      data: { hotel },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { type, price, capacity, amenities } = req.body;

    const room = await prisma.room.findUnique({ where: { id: req.params.id } });

    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found.',
      });
    }

    const updated = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        ...(type !== undefined ? { type } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
        ...(amenities !== undefined ? { amenities: normalizeAmenities(amenities) } : {}),
      },
    });

    res.status(200).json({
      status: 'success',
      data: { room: updated },
    });
  } catch (error) {
    next(error);
  }
};

const prisma = require('../config/prisma');

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string' && value.trim().startsWith('[')) return value;
  if (typeof value === 'string' && value.trim()) {
    return JSON.stringify(value.split(',').map((item) => item.trim()).filter(Boolean));
  }

  return JSON.stringify([]);
};

const normalizePhotos = (value) => {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string' && value.trim().startsWith('[')) return value;
  if (typeof value === 'string' && value.trim()) {
    return JSON.stringify(value.split(',').map((item) => item.trim()).filter(Boolean));
  }

  return JSON.stringify([]);
};

const parseJsonArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

exports.getHotels = async (req, res, next) => {
  try {
    const hotels = await prisma.hotel.findMany({
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

    res.status(200).json({
      status: 'success',
      results: hotels.length,
      data: {
        hotels: hotels.map((hotel) => ({
          ...hotel,
          amenities: parseJsonArray(hotel.amenities),
          photos: parseJsonArray(hotel.photos),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createHotel = async (req, res, next) => {
  try {
    const { name, city, location, description, rating, amenities, photos } = req.body;

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
        photos: normalizePhotos(photos),
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
    const { type, price, capacity, amenities, photos } = req.body;

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
        ...(photos !== undefined ? { photos: normalizePhotos(photos) } : {}),
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

exports.updateHotel = async (req, res, next) => {
  try {
    const { name, city, location, description, rating, amenities, photos } = req.body;

    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });

    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found.',
      });
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(rating !== undefined ? { rating: Number(rating) } : {}),
        ...(amenities !== undefined ? { amenities: normalizeAmenities(amenities) } : {}),
        ...(photos !== undefined ? { photos: normalizePhotos(photos) } : {}),
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        hotel: {
          ...updatedHotel,
          amenities: parseJsonArray(updatedHotel.amenities),
          photos: parseJsonArray(updatedHotel.photos),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });

    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        message: 'Hotel not found.',
      });
    }

    await prisma.hotel.delete({ where: { id: req.params.id } });

    res.status(200).json({
      status: 'success',
      message: 'Hotel deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecentBookings = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20);
    const activeStatuses = ['PENDING', 'CONFIRMED'];
    const now = new Date();
    const twentyEightDaysAgo = new Date(now);
    twentyEightDaysAgo.setDate(now.getDate() - 27);
    const previousTwentyEightDaysAgo = new Date(twentyEightDaysAgo);
    previousTwentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    const [bookings, aggregateRevenue, aggregateActiveCount, trendBookings, currentPeriodRevenue, previousPeriodRevenue] = await Promise.all([
      prisma.booking.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          hotel: {
            select: {
              name: true,
              city: true,
              photos: true,
            },
          },
          room: {
            select: {
              type: true,
              price: true,
            },
          },
        },
      }),
      prisma.booking.aggregate({
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.count({
        where: {
          status: {
            in: activeStatuses,
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: twentyEightDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.booking.aggregate({
        where: {
          status: {
            not: 'CANCELLED',
          },
          createdAt: {
            gte: twentyEightDaysAgo,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.aggregate({
        where: {
          status: {
            not: 'CANCELLED',
          },
          createdAt: {
            gte: previousTwentyEightDaysAgo,
            lt: twentyEightDaysAgo,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const weekBuckets = [0, 0, 0, 0];
    trendBookings.forEach((booking) => {
      const bookingDate = new Date(booking.createdAt);
      const diffDays = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || diffDays > 27) return;

      const index = Math.min(3, Math.floor((27 - diffDays) / 7));
      weekBuckets[index] += 1;
    });

    const currentRevenue = Number(currentPeriodRevenue?._sum?.totalAmount || 0);
    const previousRevenue = Number(previousPeriodRevenue?._sum?.totalAmount || 0);
    const revenueDeltaPercent = previousRevenue
      ? Number((((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings: bookings.map((booking) => ({
          ...booking,
          hotel: {
            ...booking.hotel,
            photos: parseJsonArray(booking.hotel?.photos),
          },
        })),
        summary: {
          totalRevenue: Number(aggregateRevenue?._sum?.totalAmount || 0),
          activeBookings: aggregateActiveCount,
          weeklyBookings: weekBuckets,
          revenueDeltaPercent,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingsDashboard = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const query = req.query.query?.trim();
    const startDateRaw = req.query.startDate;
    const endDateRaw = req.query.endDate;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (query) {
      where.OR = [
        { reservationNum: { contains: query } },
        { hotel: { name: { contains: query } } },
        { user: { email: { contains: query } } },
        { user: { firstName: { contains: query } } },
        { user: { lastName: { contains: query } } },
      ];
    }

    const bookingDateFilter = {};

    if (startDateRaw) {
      const startDate = new Date(startDateRaw);
      if (!Number.isNaN(startDate.getTime())) {
        bookingDateFilter.gte = startDate;
      }
    }

    if (endDateRaw) {
      const endDate = new Date(endDateRaw);
      if (!Number.isNaN(endDate.getTime())) {
        bookingDateFilter.lte = endDate;
      }
    }

    if (bookingDateFilter.gte || bookingDateFilter.lte) {
      where.createdAt = bookingDateFilter;
    }

    const activeStatuses = ['PENDING', 'CONFIRMED'];

    const [bookings, total, revenueAggregate, activeCount, roomCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          hotel: {
            select: {
              name: true,
              photos: true,
            },
          },
          room: {
            select: {
              type: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
      prisma.booking.aggregate({
        where: {
          ...where,
          status: {
            not: 'CANCELLED',
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.count({
        where: {
          ...where,
          status: {
            in: activeStatuses,
          },
        },
      }),
      prisma.room.count(),
    ]);

    const occupancy = roomCount ? Math.round((activeCount / roomCount) * 100) : 0;

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
      data: {
        summary: {
          occupancy,
          totalRevenue: Number(revenueAggregate?._sum?.totalAmount || 0),
          activeBookings: activeCount,
        },
        bookings: bookings.map((booking) => ({
          ...booking,
          paymentMethod: Number(booking.totalAmount || 0) > 2000 ? 'Bank Transfer' : 'Card',
          hotel: {
            ...booking.hotel,
            photos: parseJsonArray(booking.hotel?.photos),
          },
        })),
        insights: {
          reportTitle: 'Automated Guest Reports',
          reportSummary:
            'Monthly guest satisfaction report is ready. Insights indicate stronger repeat bookings over the selected date range.',
          reportLinkLabel: 'View Full Analysis',
          vipTag: 'Elite Concierge',
          vipTitle: 'Gold Member VIP Arrival',
          vipSummary: 'Prepare priority suite with curated welcoming amenities for high-value arrivals.',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalyticsDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const previousThirtyDays = new Date(thirtyDaysAgo);
    previousThirtyDays.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      revenueAggregate,
      confirmedRevenueAggregate,
      activeBookings,
      newMembers,
      avgHotelRating,
      monthlyBookings,
      topPropertyGrouping,
      hotels,
      recentBookings,
      previousPeriodMembers,
      currentPeriodActiveBookings,
      previousPeriodActiveBookings,
      recentCustomers,
    ] = await Promise.all([
      prisma.booking.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.hotel.aggregate({
        _avg: { rating: true },
      }),
      prisma.booking.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          status: { not: 'CANCELLED' },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),
      prisma.booking.groupBy({
        by: ['hotelId'],
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        _count: {
          hotelId: true,
        },
      }),
      prisma.hotel.findMany({
        select: {
          id: true,
          name: true,
          photos: true,
          rating: true,
        },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          hotel: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: previousThirtyDays,
            lt: thirtyDaysAgo,
          },
        },
      }),
      prisma.booking.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.booking.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          createdAt: {
            gte: previousThirtyDays,
            lt: thirtyDaysAgo,
          },
        },
      }),
      prisma.user.findMany({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const monthlyMap = new Map();
    for (let index = 0; index < 6; index += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyMap.set(key, {
        label: date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
        projected: 0,
        actual: 0,
      });
    }

    monthlyBookings.forEach((booking) => {
      const bookingDate = new Date(booking.createdAt);
      const key = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
      if (!monthlyMap.has(key)) return;

      const current = monthlyMap.get(key);
      const amount = Number(booking.totalAmount || 0);
      current.actual += amount;
      current.projected = current.actual * 1.15;
    });

    const monthlyValues = Array.from(monthlyMap.values());
    const latestMonthRevenue = Number(monthlyValues[monthlyValues.length - 1]?.actual || 0);
    const previousMonthRevenue = Number(monthlyValues[monthlyValues.length - 2]?.actual || 0);

    const hotelById = new Map(
      hotels.map((hotel) => [hotel.id, { ...hotel, photos: parseJsonArray(hotel.photos) }]),
    );

    const maxCount = Math.max(...topPropertyGrouping.map((item) => item._count.hotelId), 1);
    const topProperties = topPropertyGrouping
      .map((item) => {
        const hotel = hotelById.get(item.hotelId);
        if (!hotel) return null;

        return {
          hotelId: hotel.id,
          name: hotel.name,
          rating: hotel.rating,
          photo: hotel.photos?.[0] || null,
          demandPercent: Math.round((item._count.hotelId / maxCount) * 100),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.demandPercent - a.demandPercent)
      .slice(0, 3);

    const liveActivity = recentBookings.map((booking) => {
      const minutesAgo = Math.max(Math.round((now.getTime() - new Date(booking.createdAt).getTime()) / 60000), 1);
      const guestName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(' ') || 'Guest';

      return {
        id: booking.id,
        title: booking.status === 'CANCELLED' ? 'Cancelled Reservation' : 'New Reservation',
        subtitle:
          booking.status === 'CANCELLED'
            ? `${guestName} cancelled at ${booking.hotel?.name || 'Unknown Hotel'}`
            : `Confirmed for ${booking.hotel?.name || 'Unknown Hotel'}`,
        time: minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`,
      };
    });

    const safeDelta = (current, previous) => {
      if (!previous) return 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const membersDelta = safeDelta(newMembers, previousPeriodMembers);
    const revenueDelta = safeDelta(latestMonthRevenue, previousMonthRevenue);
    const occupancyDelta = safeDelta(currentPeriodActiveBookings, previousPeriodActiveBookings);
    const ratingLabel = Number(avgHotelRating?._avg?.rating || 0) >= 4.5 ? 'High' : 'Stable';

    const acquisitionBuckets = [0, 0, 0, 0, 0, 0];
    recentCustomers.forEach((user) => {
      const createdAt = new Date(user.createdAt);
      const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0 || diffDays > 29) return;

      const bucketIndex = Math.min(5, Math.floor((29 - diffDays) / 5));
      acquisitionBuckets[bucketIndex] += 1;
    });

    const acquisitionTrend = acquisitionBuckets.reduce((accumulator, count) => {
      const previous = accumulator.length ? accumulator[accumulator.length - 1].value : 0;
      accumulator.push({
        label: `W${accumulator.length + 1}`,
        value: previous + count,
      });
      return accumulator;
    }, []);

    const userAcquisition = acquisitionTrend[acquisitionTrend.length - 1]?.value || 0;

    const response = {
      status: 'success',
      data: {
        summary: {
          monthlyRevenue: Number(confirmedRevenueAggregate?._sum?.totalAmount || 0),
          occupancyRate: Math.min(100, Math.round((activeBookings / Math.max(hotels.length * 3, 1)) * 100)),
          newMembers,
          avgGuestRating: Number(avgHotelRating?._avg?.rating || 0),
          totalRevenue: Number(revenueAggregate?._sum?.totalAmount || 0),
          revenueDeltaPercent: revenueDelta,
          occupancyDeltaPercent: occupancyDelta,
          membersDeltaPercent: membersDelta,
          ratingLabel,
          userAcquisition,
        },
        revenuePerformance: monthlyValues,
        acquisitionTrend,
        topProperties,
        liveActivity,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

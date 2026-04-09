require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

const json = (value) => JSON.stringify(value);
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

async function main() {
  console.log('Seeding database...');

  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || 'Customer@12345';
  const customerTwoPassword = process.env.SEED_CUSTOMER2_PASSWORD || 'Customer2@12345';
  const customerThreePassword = process.env.SEED_CUSTOMER3_PASSWORD || 'Customer3@12345';

  const [adminHash, customerHash, customerTwoHash, customerThreeHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(customerPassword, 12),
    bcrypt.hash(customerTwoPassword, 12),
    bcrypt.hash(customerThreePassword, 12),
  ]);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hotelbooker.com',
      password: adminHash,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@hotelbooker.com',
      password: customerHash,
      firstName: 'Sample',
      lastName: 'Customer',
      role: 'CUSTOMER',
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'alex@hotelbooker.com',
      password: customerTwoHash,
      firstName: 'Alex',
      lastName: 'Rahman',
      role: 'CUSTOMER',
    },
  });

  const customerUser3 = await prisma.user.create({
    data: {
      email: 'maria@hotelbooker.com',
      password: customerThreeHash,
      firstName: 'Maria',
      lastName: 'Khan',
      role: 'CUSTOMER',
    },
  });

  const hotelA = await prisma.hotel.create({
    data: {
      name: 'Skyline Grand Hotel',
      city: 'Dhaka',
      location: 'Gulshan Avenue',
      description: 'Luxury city hotel with rooftop lounge and airport pickup.',
      rating: 4.6,
      amenities: json(['wifi', 'pool', 'gym', 'restaurant', 'airport-shuttle']),
      photos: json([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      ]),
      rooms: {
        create: [
          {
            type: 'Single',
            price: 95,
            capacity: 1,
            amenities: json(['wifi', 'ac', 'breakfast']),
            photos: json(['https://images.unsplash.com/photo-1618773928121-c32242e63f39']),
          },
          {
            type: 'Double',
            price: 140,
            capacity: 2,
            amenities: json(['wifi', 'ac', 'city-view', 'breakfast']),
            photos: json([
              'https://images.unsplash.com/photo-1590490360182-c33d57733427',
              'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
            ]),
          },
          {
            type: 'Suite',
            price: 260,
            capacity: 4,
            amenities: json(['wifi', 'ac', 'living-area', 'bathtub']),
            photos: json(['https://images.unsplash.com/photo-1591088398332-8a7791972843']),
          },
        ],
      },
    },
    include: { rooms: true },
  });

  const hotelB = await prisma.hotel.create({
    data: {
      name: 'Ocean Pearl Resort',
      city: 'Coxs Bazar',
      location: 'Marine Drive Road',
      description: 'Beachfront resort with sea-view rooms and family packages.',
      rating: 4.4,
      amenities: json(['wifi', 'beach-access', 'spa', 'pool', 'restaurant']),
      photos: json([
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      ]),
      rooms: {
        create: [
          {
            type: 'Double',
            price: 160,
            capacity: 2,
            amenities: json(['wifi', 'sea-view', 'balcony']),
            photos: json(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461']),
          },
          {
            type: 'Family Suite',
            price: 290,
            capacity: 5,
            amenities: json(['wifi', 'sea-view', 'kitchenette', 'living-area']),
            photos: json(['https://images.unsplash.com/photo-1611892440504-42a792e24d32']),
          },
        ],
      },
    },
    include: { rooms: true },
  });

  const hotelC = await prisma.hotel.create({
    data: {
      name: 'Hillview Retreat',
      city: 'Sylhet',
      location: 'Jaflong Scenic Road',
      description: 'Quiet retreat near tea gardens with mountain-facing balconies.',
      rating: 4.3,
      amenities: json(['wifi', 'garden', 'restaurant', 'parking', 'bonfire']),
      photos: json([
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
        'https://images.unsplash.com/photo-1470165525439-3cf9cf4f0a1b',
      ]),
      rooms: {
        create: [
          {
            type: 'Deluxe Double',
            price: 130,
            capacity: 2,
            amenities: json(['wifi', 'balcony', 'garden-view']),
            photos: json(['https://images.unsplash.com/photo-1455587734955-081b22074882']),
          },
          {
            type: 'Family Room',
            price: 210,
            capacity: 4,
            amenities: json(['wifi', 'two-bedrooms', 'living-area']),
            photos: json(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461']),
          },
          {
            type: 'Honeymoon Suite',
            price: 280,
            capacity: 2,
            amenities: json(['wifi', 'private-dining', 'jacuzzi']),
            photos: json(['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd']),
          },
        ],
      },
    },
    include: { rooms: true },
  });

  const hotelD = await prisma.hotel.create({
    data: {
      name: 'Royal Heritage Inn',
      city: 'Chittagong',
      location: 'Port Connecting Road',
      description: 'Classic-style hotel with business amenities and conference hall.',
      rating: 4.1,
      amenities: json(['wifi', 'conference-room', 'gym', 'restaurant', 'parking']),
      photos: json([
        'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858',
      ]),
      rooms: {
        create: [
          {
            type: 'Business Single',
            price: 110,
            capacity: 1,
            amenities: json(['wifi', 'work-desk', 'breakfast']),
            photos: json(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267']),
          },
          {
            type: 'Executive Double',
            price: 175,
            capacity: 2,
            amenities: json(['wifi', 'work-desk', 'city-view']),
            photos: json(['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85']),
          },
          {
            type: 'Presidential Suite',
            price: 340,
            capacity: 4,
            amenities: json(['wifi', 'living-area', 'meeting-space', 'bathtub']),
            photos: json(['https://images.unsplash.com/photo-1571896349842-33c89424de2d']),
          },
        ],
      },
    },
    include: { rooms: true },
  });

  const hotelE = await prisma.hotel.create({
    data: {
      name: 'Lakeside Boutique Stay',
      city: 'Rangamati',
      location: 'Kaptai Lakefront',
      description: 'Boutique stay with lake-view cottages and kayaking activities.',
      rating: 4.5,
      amenities: json(['wifi', 'lake-view', 'kayak', 'restaurant', 'parking']),
      photos: json([
        'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
      ]),
      rooms: {
        create: [
          {
            type: 'Cottage Room',
            price: 145,
            capacity: 2,
            amenities: json(['wifi', 'lake-view', 'private-deck']),
            photos: json(['https://images.unsplash.com/photo-1566665797739-1674de7a421a']),
          },
          {
            type: 'Premium Cottage',
            price: 225,
            capacity: 3,
            amenities: json(['wifi', 'lake-view', 'private-deck', 'sofa-bed']),
            photos: json(['https://images.unsplash.com/photo-1560185127-6ed189bf02f4']),
          },
          {
            type: 'Lakefront Villa',
            price: 360,
            capacity: 6,
            amenities: json(['wifi', 'kitchen', 'private-garden', 'barbecue']),
            photos: json(['https://images.unsplash.com/photo-1570129477492-45c003edd2be']),
          },
        ],
      },
    },
    include: { rooms: true },
  });

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const nextTwoMonths = new Date(now);
  nextTwoMonths.setMonth(nextTwoMonths.getMonth() + 2);

  const nextThreeMonths = new Date(now);
  nextThreeMonths.setMonth(nextThreeMonths.getMonth() + 3);

  const yesterday = addDays(now, -1);
  const lastMonth = addDays(now, -30);

  const welcomePromo = await prisma.promotion.create({
    data: {
      code: 'WELCOME10',
      discountPercent: 10,
      validFrom: now,
      validUntil: nextMonth,
      isActive: true,
    },
  });

  await prisma.promotion.createMany({
    data: [
      {
        code: 'SUMMER20',
        discountPercent: 20,
        validFrom: now,
        validUntil: nextTwoMonths,
        isActive: true,
      },
      {
        code: 'FAMILY15',
        discountPercent: 15,
        validFrom: now,
        validUntil: nextThreeMonths,
        isActive: true,
      },
      {
        code: 'EARLYBIRD5',
        discountPercent: 5,
        validFrom: now,
        validUntil: nextThreeMonths,
        isActive: true,
      },
      {
        code: 'EXPIRED30',
        discountPercent: 30,
        validFrom: lastMonth,
        validUntil: yesterday,
        isActive: false,
      },
    ],
  });

  const allHotels = [hotelA, hotelB, hotelC, hotelD, hotelE];
  const allRooms = allHotels.flatMap((hotel) => hotel.rooms);

  await prisma.booking.createMany({
    data: [
      {
        reservationNum: 'RES-SEED-1001',
        userId: customerUser.id,
        hotelId: hotelA.id,
        roomId: hotelA.rooms[1].id,
        checkInDate: addDays(now, 3),
        checkOutDate: addDays(now, 6),
        guests: 2,
        totalAmount: 378,
        status: 'CONFIRMED',
        promotionId: welcomePromo.id,
      },
      {
        reservationNum: 'RES-SEED-1002',
        userId: customerUser2.id,
        hotelId: hotelB.id,
        roomId: hotelB.rooms[0].id,
        checkInDate: addDays(now, 10),
        checkOutDate: addDays(now, 13),
        guests: 2,
        totalAmount: 480,
        status: 'PENDING',
        promotionId: null,
      },
      {
        reservationNum: 'RES-SEED-1003',
        userId: customerUser3.id,
        hotelId: hotelC.id,
        roomId: hotelC.rooms[2].id,
        checkInDate: addDays(now, -20),
        checkOutDate: addDays(now, -17),
        guests: 2,
        totalAmount: 756,
        status: 'COMPLETED',
        promotionId: null,
      },
      {
        reservationNum: 'RES-SEED-1004',
        userId: customerUser.id,
        hotelId: hotelD.id,
        roomId: hotelD.rooms[1].id,
        checkInDate: addDays(now, 15),
        checkOutDate: addDays(now, 18),
        guests: 2,
        totalAmount: 525,
        status: 'CANCELLED',
        promotionId: null,
      },
      {
        reservationNum: 'RES-SEED-1005',
        userId: customerUser2.id,
        hotelId: hotelE.id,
        roomId: hotelE.rooms[0].id,
        checkInDate: addDays(now, 22),
        checkOutDate: addDays(now, 26),
        guests: 2,
        totalAmount: 580,
        status: 'CONFIRMED',
        promotionId: null,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Admin login:', adminUser.email, adminPassword);
  console.log('Customer login:', customerUser.email, customerPassword);
  console.log('Customer 2 login:', customerUser2.email, customerTwoPassword);
  console.log('Customer 3 login:', customerUser3.email, customerThreePassword);
  console.log('Hotels created:', allHotels.map((hotel) => hotel.name).join(', '));
  console.log('Rooms created:', allRooms.length);
  console.log('Promotions created: 5');
  console.log('Sample bookings created: 5');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

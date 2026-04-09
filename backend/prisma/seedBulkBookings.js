require('dotenv').config();
const prisma = require('../src/config/prisma');

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

function createReservationNumber(index) {
  const now = Date.now();
  return `RES-BULK-${now}-${String(index + 1).padStart(4, '0')}`;
}

async function main() {
  const requestedCount = Number(process.argv[2]);
  const bookingsToCreate = Number.isInteger(requestedCount) && requestedCount > 0 ? requestedCount : 100;

  console.log(`Adding ${bookingsToCreate} generated bookings...`);

  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { id: true, email: true },
  });

  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      hotelId: true,
      price: true,
      capacity: true,
    },
  });

  const promotions = await prisma.promotion.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  if (!users.length) {
    throw new Error('No customer users found. Seed users first.');
  }

  if (!rooms.length) {
    throw new Error('No rooms found. Seed hotels/rooms first.');
  }

  const now = new Date();
  const bookingsToInsert = [];

  for (let index = 0; index < bookingsToCreate; index += 1) {
    const room = rooms[index % rooms.length];
    const user = users[index % users.length];

    // Spread bookings over the last 90 days and next 60 days.
    const startOffset = (index % 151) - 90;
    const stayLength = 1 + (index % 5);
    const checkInDate = addDays(now, startOffset);
    const checkOutDate = addDays(checkInDate, stayLength);

    const guests = Math.max(1, Math.min(room.capacity, 1 + (index % 4)));
    const baseAmount = Number(room.price) * stayLength;

    let status = 'CONFIRMED';
    if (index % 8 === 0) status = 'PENDING';
    if (index % 11 === 0) status = 'CANCELLED';
    if (index % 5 === 0) status = 'COMPLETED';

    let promotionId = null;
    let totalAmount = baseAmount;

    if (promotions.length && index % 6 === 0) {
      promotionId = promotions[index % promotions.length].id;
      totalAmount = Number((baseAmount * 0.9).toFixed(2));
    }

    bookingsToInsert.push({
      reservationNum: createReservationNumber(index),
      userId: user.id,
      hotelId: room.hotelId,
      roomId: room.id,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      status,
      promotionId,
    });
  }

  await prisma.booking.createMany({
    data: bookingsToInsert,
  });

  const totalBookings = await prisma.booking.count();

  console.log(`Created bookings: ${bookingsToCreate}`);
  console.log(`Total bookings in DB: ${totalBookings}`);
}

main()
  .catch((error) => {
    console.error('Bulk booking seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

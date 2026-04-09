require('dotenv').config();
const prisma = require('../src/config/prisma');

const json = (value) => JSON.stringify(value);

const CITIES = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Coxs Bazar',
  'Comilla',
  'Narayanganj',
  'Gazipur',
  'Jessore',
  'Bogura',
  'Narsingdi',
  'Tangail',
  'Dinajpur',
  'Pabna',
  'Noakhali',
  'Feni',
  'Brahmanbaria',
  'Kushtia',
  'Chuadanga',
  'Rangamati',
  'Bandarban',
];

const DISTRICTS = [
  'Central Avenue',
  'Lake View Road',
  'Sunset Drive',
  'Emerald Square',
  'Heritage Lane',
  'Skyline Boulevard',
  'Marina Point',
  'Orchid Street',
  'Maple Residency',
  'Golden Circle',
  'Pearl Crossing',
  'Royal Garden',
  'Crescent Heights',
  'Palm Residency',
  'Riverfront Walk',
  'Tea Garden View',
  'Executive Park',
  'Bayfront Plaza',
  'Hilltop Ridge',
  'Harbor Point',
  'Meadow Court',
  'Urban Nest',
  'Canal Side',
  'Willow Residency',
  'Lotus Promenade',
];

const PREFIXES = [
  'Azure',
  'Grand',
  'Royal',
  'Elite',
  'Golden',
  'Serene',
  'Urban',
  'Majestic',
  'Crystal',
  'Oceanic',
];

const SUFFIXES = [
  'Heights',
  'Haven',
  'Retreat',
  'Residency',
  'Suites',
  'Villa',
  'Palace',
  'Inn',
  'Lounge',
  'Collection',
];

const HOTEL_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
];

const ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  'https://images.unsplash.com/photo-1455587734955-081b22074882',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843',
];

const AMENITY_POOLS = [
  ['wifi', 'restaurant', 'parking', 'breakfast'],
  ['wifi', 'pool', 'gym', 'restaurant'],
  ['wifi', 'spa', 'airport-shuttle', 'gym'],
  ['wifi', 'city-view', 'parking', 'laundry'],
  ['wifi', 'conference-room', 'restaurant', 'gym'],
];

function buildHotel(index) {
  const city = CITIES[index % CITIES.length];
  const district = DISTRICTS[index % DISTRICTS.length];
  const prefix = PREFIXES[index % PREFIXES.length];
  const suffix = SUFFIXES[index % SUFFIXES.length];
  const photoA = HOTEL_PHOTOS[index % HOTEL_PHOTOS.length];
  const photoB = HOTEL_PHOTOS[(index + 3) % HOTEL_PHOTOS.length];
  const amenities = AMENITY_POOLS[index % AMENITY_POOLS.length];

  const hotelName = `${prefix} ${city} ${suffix} ${index + 1}`;
  const location = `${district}, Zone ${Math.floor(index / CITIES.length) + 1}, ${city}`;
  const rating = Number((3.8 + ((index % 12) * 0.1)).toFixed(1));

  return {
    name: hotelName,
    city,
    location,
    description: `${hotelName} offers premium comfort, local hospitality, and curated experiences in ${city}.`,
    rating,
    amenities: json(amenities),
    photos: json([photoA, photoB]),
  };
}

function buildRooms(index) {
  const base = 70 + (index % 20) * 5;
  return [
    {
      type: 'Standard',
      price: base,
      capacity: 2,
      amenities: json(['wifi', 'ac', 'tv']),
      photos: json([ROOM_PHOTOS[index % ROOM_PHOTOS.length]]),
    },
    {
      type: 'Deluxe',
      price: base + 35,
      capacity: 3,
      amenities: json(['wifi', 'ac', 'tv', 'breakfast']),
      photos: json([ROOM_PHOTOS[(index + 2) % ROOM_PHOTOS.length]]),
    },
  ];
}

async function main() {
  console.log('Adding 100 generated hotels with different locations...');

  const hotelsToCreate = 100;
  let createdCount = 0;

  for (let index = 0; index < hotelsToCreate; index += 1) {
    const hotelData = buildHotel(index);

    await prisma.hotel.create({
      data: {
        ...hotelData,
        rooms: {
          create: buildRooms(index),
        },
      },
    });

    createdCount += 1;
  }

  const totalHotels = await prisma.hotel.count();
  const totalRooms = await prisma.room.count();

  console.log(`Created hotels: ${createdCount}`);
  console.log(`Total hotels in DB: ${totalHotels}`);
  console.log(`Total rooms in DB: ${totalRooms}`);
}

main()
  .catch((error) => {
    console.error('Bulk hotel seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

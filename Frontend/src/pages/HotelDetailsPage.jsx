import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import {
  FiCoffee,
  FiEye,
  FiMapPin,
  FiNavigation,
  FiShield,
  FiStar,
  FiSun,
  FiWifi,
  FiWind,
  FiUsers,
  FiCheckSquare,
  FiSquare,
  FiAnchor,
  FiUsers as FiUsersGroup,
} from 'react-icons/fi';
import { api } from '../lib/api';
import { formatAmenityLabel } from '../lib/amenities';

function parsePhotos(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return raw.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
}

function amenityIcon(label) {
  const value = String(label || '').toLowerCase();
  if (value.includes('wifi')) return <FiWifi size={14} />;
  if (value.includes('view')) return <FiEye size={14} />;
  if (value.includes('kayak') || value.includes('boat')) return <FiAnchor size={14} />;
  if (value.includes('breakfast') || value.includes('dining')) return <FiCoffee size={14} />;
  if (value.includes('air') || value.includes('ac')) return <FiWind size={14} />;
  if (value.includes('pool') || value.includes('spa')) return <FiSun size={14} />;
  if (value.includes('fitness') || value.includes('gym')) return <FiUsers size={14} />;
  if (value.includes('parking') || value.includes('valet')) return <FiNavigation size={14} />;
  return <FiShield size={14} />;
}

function resolveCoordinates(city, location) {
  const key = `${city || ''} ${location || ''}`.toLowerCase();
  const map = [
    { match: 'paris', coords: [48.8566, 2.3522] },
    { match: 'london', coords: [51.5072, -0.1276] },
    { match: 'barcelona', coords: [41.3874, 2.1686] },
    { match: 'monaco', coords: [43.7384, 7.4246] },
    { match: 'amalfi', coords: [40.6333, 14.6027] },
    { match: 'aspen', coords: [39.1911, -106.8175] },
    { match: 'kaptai', coords: [22.4972, 92.2314] },
  ];

  const found = map.find((item) => key.includes(item.match));
  return found ? found.coords : [48.8566, 2.3522];
}

function HotelDetailsPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/hotels/${id}`)
      .then((data) => {
        const nextHotel = data?.data?.hotel || null;
        setHotel(nextHotel);
        if (nextHotel?.rooms?.[0]?.id) {
          setSelectedRoomId(nextHotel.rooms[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="error-text">{error}</p>;
  if (!hotel) return <p>Loading hotel details...</p>;

  const photos = parsePhotos(hotel.photos);
  const mainPhoto = photos[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
  const sidePhotos = photos.slice(1, 3);
  const extraPhotos = Math.max(0, photos.length - 3);

  const rooms = hotel.rooms || [];
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || rooms[0] || null;

  const nights = 7;
  const nightlyRate = Number(selectedRoom?.price || 0);
  const subtotal = nightlyRate * nights;
  const cleaningFee = 80;
  const serviceFee = 120;
  const total = subtotal + cleaningFee + serviceFee;

  const reviews = [
    {
      id: 'r1',
      name: 'Elena Mitchell',
      initials: 'EM',
      meta: 'Oct 2023 · Verified Stay',
      rating: 5.0,
      text: 'The most incredible service I have ever experienced. From valet to housekeeping, every detail felt perfectly curated.',
    },
    {
      id: 'r2',
      name: 'James Thornton',
      initials: 'JT',
      meta: 'Sep 2023 · Verified Stay',
      rating: 4.8,
      text: 'A perfect blend of modern comfort and classic hospitality. Worth every penny for the location and amenities.',
    },
  ];

  const roomHints = [
    'Includes city view balcony',
    'High floor, quiet zone',
    'Full kitchen & private lift',
  ];

  const mapCenter = resolveCoordinates(hotel.city, hotel.location);

  return (
    <div className="stack-lg hd-page">
      <section className="hd-gallery-grid">
        <img className="hd-main-photo" src={mainPhoto} alt={hotel.name} />
        <div className="hd-side-photos">
          {sidePhotos.map((photo, index) => (
            <div key={`${photo}-${index}`} className="hd-side-photo-wrap">
              <img src={photo} alt={hotel.name} />
              {index === sidePhotos.length - 1 && extraPhotos > 0 && <span>+{extraPhotos} photos</span>}
            </div>
          ))}

          {!sidePhotos.length && (
            <div className="hd-side-photo-wrap">
              <img src={mainPhoto} alt={hotel.name} />
            </div>
          )}
        </div>
      </section>

      <section className="hd-content-grid">
        <div className="hd-left-col">
          <header className="hd-header">
            <p className="hd-kicker">★★★★★ Luxury Resort</p>
            <h1>{hotel.name}</h1>
            <p><FiMapPin size={14} /> {hotel.location || `${hotel.city}, France`} <a href="#location">View on Map</a></p>
          </header>

          <article className="hd-about-card">
            <h2>About the property</h2>
            <p>{hotel.description || 'Nestled in the heart of the historic district, this sanctuary blends timeless elegance with modern comfort for a truly elevated stay.'}</p>
          </article>

          <section className="hd-amenities">
            <h2>Premium Amenities</h2>
            <div className="hd-amenity-grid">
              {(hotel.amenities || []).map((amenity) => (
                <article key={amenity}>
                  <span>{amenityIcon(amenity)}</span>
                  <p>{formatAmenityLabel(amenity)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="hd-availability">
            <h2>Availability</h2>
            <div className="hd-rooms-table">
              <div className="hd-rooms-head">
                <span>Room Type</span>
                <span>Capacity</span>
                <span>Price</span>
                <span>Select</span>
              </div>

              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                <button
                  key={room.id}
                  className={isSelected ? 'hd-room-row selected' : 'hd-room-row'}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <div>
                    <strong>{room.type}</strong>
                    <p>{roomHints[Math.min(roomHints.length - 1, rooms.indexOf(room))] || 'Full comfort and curated details'}</p>
                  </div>
                  <span className="hd-capacity" aria-label={`${Number(room.capacity || 1)} guests`}>
                    {Array.from({ length: Math.min(4, Math.max(1, Number(room.capacity || 1))) }).map((_, index) => (
                      <FiUsersGroup key={`${room.id}-guest-${index}`} size={13} />
                    ))}
                  </span>
                  <span className="hd-price">${Number(room.price || 0).toLocaleString()} <small>/ night</small></span>
                  <span className="hd-select-cell">{isSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}</span>
                </button>
              );
              })}
            </div>
          </section>

          <section className="hd-reviews">
            <h2>Guest Reviews</h2>
            <div className="hd-review-summary">
              <strong>{Number(hotel.rating || 4.9).toFixed(1)}</strong>
              <div>
                <span className="hd-stars">★★★★★</span>
                <small>Based on 1,240 reviews</small>
              </div>
            </div>

            <div className="hd-review-grid">
              {reviews.map((review) => (
                <article key={review.id}>
                  <header>
                    <div className="hd-review-person">
                      <span>{review.initials}</span>
                      <div>
                        <strong>{review.name}</strong>
                        <small>{review.meta}</small>
                      </div>
                    </div>
                    <span>{review.rating}</span>
                  </header>
                  <p>&quot;{review.text}&quot;</p>
                </article>
              ))}
            </div>
          </section>

          <section id="location" className="hd-map-section">
            <h2>Location</h2>
            <div className="hd-map-canvas">
              <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CircleMarker center={mapCenter} radius={10} pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 0.8 }}>
                  <Popup>
                    <strong>{hotel.name}</strong>
                    <br />
                    {hotel.location || hotel.city}
                  </Popup>
                </CircleMarker>
              </MapContainer>
            </div>
          </section>
        </div>

        <aside className="hd-booking-side">
          <article className="hd-price-card">
            <h3>${nightlyRate.toLocaleString()} <small>/ night</small></h3>

            <div className="hd-date-card">
              <div>
                <span>Check-In</span>
                <strong>Nov 14, 2024</strong>
              </div>
              <div>
                <span>Check-Out</span>
                <strong>Nov 21, 2024</strong>
              </div>
              <div className="span-two">
                <span>Guests</span>
                <strong>2 Adults, 0 Children</strong>
              </div>
            </div>

            <div className="hd-fee-line"><span>${nightlyRate.toLocaleString()} x {nights} nights</span><strong>${subtotal.toLocaleString()}</strong></div>
            <div className="hd-fee-line"><span>Cleaning fee</span><strong>${cleaningFee.toLocaleString()}</strong></div>
            <div className="hd-fee-line"><span>Service fee</span><strong>${serviceFee.toLocaleString()}</strong></div>
            <div className="hd-fee-line total"><span>Total</span><strong>${total.toLocaleString()}</strong></div>

            <Button
              component={Link}
              to={`/booking?roomId=${selectedRoom?.id || ''}&hotelId=${hotel.id}`}
              variant="contained"
              color="primary"
              disabled={!selectedRoom}
            >
              Book Now
            </Button>

            <small>You won&apos;t be charged yet.</small>
          </article>

          <article className="hd-value-card">
            <h4>✨ Voyager Select</h4>
            <p>This property is part of our curated collection, guaranteeing the highest standard of service.</p>
          </article>
        </aside>
      </section>
    </div>
  );
}

export default HotelDetailsPage;

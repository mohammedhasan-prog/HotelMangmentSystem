import { Link, useLocation } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { FiCalendar, FiCheckCircle, FiDownload, FiFileText, FiHome, FiMapPin, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

function parseHotelPhoto(hotel) {
  const fallback = 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
  const source = hotel?.photos;

  if (Array.isArray(source)) return source[0] || fallback;

  if (typeof source === 'string') {
    try {
      const parsed = JSON.parse(source);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      const first = source.split(',').map((item) => item.trim()).filter(Boolean)[0];
      if (first) return first;
    }
  }

  return fallback;
}

function getNights(booking) {
  const start = new Date(booking?.checkInDate);
  const end = new Date(booking?.checkOutDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function BookingConfirmationPage() {
  const { state } = useLocation();
  const booking = state?.booking;
  const checkout = state?.checkout || {};
  const checkIn = booking?.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'TBD';
  const checkOut = booking?.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'TBD';
  const nights = getNights(booking);
  const total = Number(booking?.totalAmount || 0);
  const promoPercent = Number(booking?.promotion?.discountPercent || 0);
  const baseBeforeDiscount = promoPercent > 0 ? total / (1 - promoPercent / 100) : total;
  const promoDiscountAmount = promoPercent > 0 ? Math.max(0, baseBeforeDiscount - total) : 0;
  const paymentMethod = checkout.paymentMethod === 'wallet' ? 'Apple Pay / Digital Wallet' : 'Credit / Debit Card';
  const paymentTail = checkout.cardLast4 ? ` ending in ${checkout.cardLast4}` : '';
  const serviceAndTax = total * 0.13;
  const baseStay = Math.max(0, baseBeforeDiscount - serviceAndTax);

  if (!booking) {
    return (
      <div className="stack-lg narrow confirmation-empty">
        <Alert severity="info" variant="outlined">
          Complete a booking first to see confirmation details.
        </Alert>
        <Button component={Link} to="/hotels" variant="contained" color="primary" startIcon={<FiHome />}>
          Back to Hotels
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="stack-lg narrow booking-confirm-shell"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
    >
      <Card className="booking-confirm-card">
        <CardContent>
          <header className="confirm-top">
            <div className="confirm-icon-wrap">
              <FiCheckCircle size={34} />
            </div>
            <h1>Your booking is confirmed!</h1>
            <p>Reservation Number: <strong>{booking.reservationNum || 'Pending'}</strong></p>
          </header>

          <div className="confirm-main-grid">
            <section className="confirm-left">
              <div className="confirm-hotel-card">
                <img src={parseHotelPhoto(booking.hotel)} alt={booking.hotel?.name || 'Hotel'} />
                <div>
                  <span>Hotel Summary</span>
                  <h3>{booking.hotel?.name || 'Your Reserved Stay'}</h3>
                  <p><FiMapPin size={13} /> {booking.hotel?.location || booking.hotel?.city || 'Location pending'}</p>
                </div>
              </div>

              <div className="confirm-dates">
                <article>
                  <small>Check-In</small>
                  <strong>{checkIn}</strong>
                  <span>After 3:00 PM</span>
                </article>
                <article>
                  <small>Check-Out</small>
                  <strong>{checkOut}</strong>
                  <span>Before 11:00 AM</span>
                </article>
              </div>

              <div className="confirm-guest-line">
                <FiUsers size={15} />
                <div>
                  <strong>{booking.guests || 1} Guest{Number(booking.guests || 1) > 1 ? 's' : ''}</strong>
                  <p>{booking.room?.type || 'Deluxe Suite'} • Reserved Experience</p>
                </div>
              </div>
            </section>

            <aside className="confirm-right">
              <h4>Payment Details</h4>
              <div className="confirm-price-line"><span>{nights} Night{nights > 1 ? 's' : ''} Stay</span><strong>${baseStay.toFixed(2)}</strong></div>
              {promoDiscountAmount > 0 && (
                <div className="confirm-price-line promo">
                  <span>Promotion ({booking?.promotion?.code || 'Code'})</span>
                  <strong>-${promoDiscountAmount.toFixed(2)}</strong>
                </div>
              )}
              <div className="confirm-price-line"><span>Service &amp; Taxes</span><strong>${serviceAndTax.toFixed(2)}</strong></div>
              <div className="confirm-price-line total"><span>Total Price</span><strong>${total.toFixed(2)}</strong></div>

              <div className="confirm-payment-chip">
                <FiFileText size={14} />
                <div>
                  <small>Payment Method</small>
                  <p>{paymentMethod}{paymentTail}</p>
                </div>
              </div>

              <Button variant="outlined" color="inherit" startIcon={<FiDownload />}>Download PDF Receipt</Button>
              <Button variant="outlined" color="inherit" startIcon={<FiCalendar />}>Add to Calendar</Button>
            </aside>
          </div>

          <footer className="confirm-actions">
            <Button component={Link} to="/dashboard" variant="contained" color="secondary">View My Bookings</Button>
            <Button component={Link} to="/" variant="outlined" color="inherit" startIcon={<FiHome />}>Go to Home</Button>
          </footer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BookingConfirmationPage;

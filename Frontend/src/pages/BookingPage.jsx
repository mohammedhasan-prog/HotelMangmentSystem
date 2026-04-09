import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { api } from '../lib/api';

function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId') || '';
  const hotelId = searchParams.get('hotelId') || '';

  const [form, setForm] = useState({
    roomId,
    checkInDate: '',
    checkOutDate: '',
    guests: 2,
    promotionCode: '',
  });
  const [guest, setGuest] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState({
    status: 'idle',
    code: '',
    discountPercent: 0,
    message: '',
  });
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [activePromotions, setActivePromotions] = useState([]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, roomId }));
  }, [roomId]);

  useEffect(() => {
    if (!hotelId) return;

    api.get(`/hotels/${hotelId}`)
      .then((res) => {
        const hotelData = res?.data?.hotel;
        setHotel(hotelData || null);

        if (!hotelData) return;
        const pickedRoom = (hotelData.rooms || []).find((item) => item.id === roomId) || hotelData.rooms?.[0] || null;
        setRoom(pickedRoom);

        if (!roomId && pickedRoom?.id) {
          setForm((prev) => ({ ...prev, roomId: pickedRoom.id }));
        }
      })
      .catch(() => {
        setHotel(null);
        setRoom(null);
      });
  }, [hotelId, roomId]);

  useEffect(() => {
    api.get('/promotions/active')
      .then((res) => {
        setActivePromotions(res?.data?.promotions || []);
      })
      .catch(() => {
        setActivePromotions([]);
      });
  }, []);

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const updateGuest = (field) => (event) => {
    setGuest((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const checkIn = form.checkInDate ? new Date(form.checkInDate) : null;
  const checkOut = form.checkOutDate ? new Date(form.checkOutDate) : null;
  const nights = checkIn && checkOut && checkOut > checkIn
    ? Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))
    : 0;

  const nightly = Number(room?.price || 0);
  const subtotal = nightly * nights;
  const serviceFee = subtotal > 0 ? 125 : 0;
  const discountAmount = promoFeedback.status === 'applied'
    ? (subtotal * promoFeedback.discountPercent) / 100
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxes = discountedSubtotal > 0 ? discountedSubtotal * 0.12 : 0;
  const total = discountedSubtotal + serviceFee + taxes;

  const normalizePromoCode = (value) => value.trim().toUpperCase();

  const applyPromotionCode = async (forcedCode) => {
    const normalizedCode = normalizePromoCode(forcedCode ?? form.promotionCode ?? '');

    if (!normalizedCode) {
      setPromoFeedback({
        status: 'error',
        code: '',
        discountPercent: 0,
        message: 'Please enter a promo code first.',
      });
      return;
    }

    if (!subtotal || nights < 1) {
      setPromoFeedback({
        status: 'error',
        code: normalizedCode,
        discountPercent: 0,
        message: 'Select valid check-in/check-out dates before applying a code.',
      });
      return;
    }

    setApplyingPromo(true);
    setPromoFeedback((prev) => ({
      ...prev,
      status: 'loading',
      message: '',
      code: normalizedCode,
      discountPercent: 0,
    }));

    try {
      const result = await api.post('/promotions/apply', {
        code: normalizedCode,
        amount: Number(subtotal.toFixed(2)),
      });

      const discountPercent = Number(result?.data?.discountPercent || 0);

      setForm((prev) => ({
        ...prev,
        promotionCode: normalizedCode,
      }));

      setPromoFeedback({
        status: 'applied',
        code: normalizedCode,
        discountPercent,
        message: `${normalizedCode} applied (${discountPercent}% off room cost).`,
      });
    } catch (err) {
      setPromoFeedback({
        status: 'error',
        code: normalizedCode,
        discountPercent: 0,
        message: err.message,
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedPromo = normalizePromoCode(form.promotionCode || '');
      const payload = {
        roomId: form.roomId,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        guests: Number(form.guests),
        promotionCode: normalizedPromo || undefined,
      };

      const result = await api.post('/bookings', payload);
      navigate('/booking-confirmation', {
        state: {
          booking: result?.data?.booking,
          checkout: {
            paymentMethod,
            cardLast4: guest.cardNumber ? guest.cardNumber.replace(/\s+/g, '').slice(-4) : '',
          },
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack-lg">
      <header className="booking-header">
        <span className="booking-kicker">Checkout Journey</span>
        <h1>Secure Your Sanctuary</h1>
        <p>Your refined escape is just a moment away. Complete your details below to finalize your curated stay.</p>
      </header>

      <form className="booking-shell" onSubmit={onSubmit}>
        <section className="booking-left">
          <article className="booking-block">
            <h2>Guest Details</h2>
            <div className="grid-two">
              <TextField label="Full Name" placeholder="Full Name" value={guest.fullName} onChange={updateGuest('fullName')} required fullWidth />
              <TextField type="email" label="Email Address" placeholder="Email Address" value={guest.email} onChange={updateGuest('email')} required fullWidth />
              <TextField className="span-two" label="Phone Number" placeholder="Phone Number" value={guest.phone} onChange={updateGuest('phone')} required fullWidth />
            </div>
          </article>

          <article className="booking-block">
            <h2>Booking Details</h2>
            <div className="grid-two">
              <TextField label="Room ID" placeholder="Room ID" value={form.roomId} onChange={update('roomId')} required fullWidth />
              <TextField type="number" inputProps={{ min: 1 }} label="Guests" placeholder="Guests" value={form.guests} onChange={update('guests')} required fullWidth />
              <div className="field-stack">
                <span>Check In</span>
                <TextField type="date" value={form.checkInDate} onChange={update('checkInDate')} required fullWidth inputProps={{ 'aria-label': 'Check In' }} />
              </div>
              <div className="field-stack">
                <span>Check Out</span>
                <TextField type="date" value={form.checkOutDate} onChange={update('checkOutDate')} required fullWidth inputProps={{ 'aria-label': 'Check Out' }} />
              </div>
              <div className="span-two booking-promo-wrap">
                <TextField
                  label="Promotion Code"
                  placeholder="Promotion code (optional)"
                  value={form.promotionCode}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setForm((prev) => ({ ...prev, promotionCode: nextValue }));

                    if (promoFeedback.status !== 'idle' || promoFeedback.message) {
                      setPromoFeedback({
                        status: 'idle',
                        code: '',
                        discountPercent: 0,
                        message: '',
                      });
                    }
                  }}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={applyPromotionCode}
                  disabled={applyingPromo}
                  className="promo-apply-btn"
                >
                  {applyingPromo ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              {activePromotions.length > 0 && (
                <div className="span-two promo-suggestions">
                  <span>Available Offers</span>
                  <div className="promo-chip-row">
                    {activePromotions.map((promo) => {
                      const code = String(promo.code || '').toUpperCase();
                      const discountPercent = Number(promo.discountPercent || 0);

                      return (
                        <button
                          key={promo.id || code}
                          type="button"
                          className={form.promotionCode.toUpperCase() === code ? 'promo-chip active' : 'promo-chip'}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, promotionCode: code }));
                            applyPromotionCode(code);
                          }}
                          disabled={applyingPromo}
                        >
                          <strong>{code}</strong>
                          <small>{discountPercent}% OFF</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {promoFeedback.message && (
                <p className={promoFeedback.status === 'applied' ? 'promo-ok' : 'promo-bad'}>
                  {promoFeedback.message}
                </p>
              )}
            </div>
          </article>

          <article className="booking-block">
            <h2>Special Requests</h2>
            <TextField multiline minRows={3} placeholder="High floor, quiet room, or dietary requirements..." value={guest.notes} onChange={updateGuest('notes')} fullWidth />
          </article>

          <article className="booking-block">
            <div className="booking-block-head">
              <h2>Payment Method</h2>
              <span>Secure 256-bit SSL</span>
            </div>

            <ToggleButtonGroup
              className="pay-methods"
              value={paymentMethod}
              exclusive
              onChange={(_, value) => {
                if (value) setPaymentMethod(value);
              }}
              fullWidth
            >
              <ToggleButton value="card" className={paymentMethod === 'card' ? 'method active' : 'method'}>
                <strong>Credit / Debit Card</strong>
                <small>Visa, Mastercard, Amex</small>
              </ToggleButton>
              <ToggleButton value="wallet" className={paymentMethod === 'wallet' ? 'method active' : 'method'}>
                <strong>Apple Pay / Digital Wallet</strong>
                <small>Instant &amp; Secure checkout</small>
              </ToggleButton>
            </ToggleButtonGroup>

            <div className="grid-two payment-fields">
              <TextField className="span-two" label="Card Number" placeholder="Card Number" value={guest.cardNumber} onChange={updateGuest('cardNumber')} required={paymentMethod === 'card'} fullWidth />
              <TextField label="MM / YY" placeholder="MM / YY" value={guest.expiry} onChange={updateGuest('expiry')} required={paymentMethod === 'card'} fullWidth />
              <TextField label="CVV" placeholder="CVV" value={guest.cvv} onChange={updateGuest('cvv')} required={paymentMethod === 'card'} fullWidth />
            </div>
          </article>

          {error && <p className="error-text">{error}</p>}
        </section>

        <aside className="booking-right">
          <div className="summary-card">
            <div className="summary-image-wrap">
              <img src={room?.photos?.[0] || hotel?.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} alt={hotel?.name || 'Hotel'} />
              <span className="summary-pill">Premium Selection</span>
            </div>

            <div className="summary-body">
              <h3>{hotel?.name || 'The Obsidian Horizon'}</h3>
              <p>{room?.type || 'Skyline King Suite'}</p>

              <div className="summary-dates">
                <div>
                  <span>Check-In</span>
                  <strong>{form.checkInDate || '-'}</strong>
                </div>
                <div>
                  <span>Check-Out</span>
                  <strong>{form.checkOutDate || '-'}</strong>
                </div>
              </div>

              <div className="summary-line"><span>Nightly Rate</span><span>${nightly.toFixed(2)}</span></div>
              <div className="summary-line"><span>Nights</span><span>{nights}</span></div>
              <div className="summary-line"><span>Room Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && (
                <div className="summary-line summary-discount">
                  <span>Promo Discount ({promoFeedback.code || normalizePromoCode(form.promotionCode || '')})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-line"><span>Service &amp; Resort Fees</span><span>${serviceFee.toFixed(2)}</span></div>
              <div className="summary-line"><span>Tourism Taxes (12%)</span><span>${taxes.toFixed(2)}</span></div>

              <div className="summary-total">
                <div>
                  <span>Total Amount</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
                <small>USD</small>
              </div>

              <Button className="summary-cta" variant="contained" color="primary" disabled={loading} type="submit" fullWidth>
                {loading ? 'Processing...' : 'Confirm & Pay Securely'}
              </Button>

              <p className="fine-print">
                By clicking "Confirm & Pay", you agree to our Booking Terms and Cancellation Policy.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default BookingPage;

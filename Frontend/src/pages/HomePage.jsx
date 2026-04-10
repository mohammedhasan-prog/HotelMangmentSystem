import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { FiCalendar, FiGlobe, FiMail, FiMapPin, FiShare2, FiUsers } from 'react-icons/fi';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { api } from '../lib/api';

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

function HomePage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [searchCatalog, setSearchCatalog] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchForm, setSearchForm] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
  });

  useEffect(() => {
    api.get('/hotels?limit=3')
      .then((data) => setHotels(data?.data?.hotels || []))
      .catch(() => setHotels([]));
  }, []);

  useEffect(() => {
    api.get('/hotels?limit=100&page=1')
      .then((data) => setSearchCatalog(data?.data?.hotels || []))
      .catch(() => setSearchCatalog([]));
  }, []);

  const citySuggestions = useMemo(() => {
    const source = searchCatalog.length ? searchCatalog : hotels;
    const typed = searchForm.city.trim().toLowerCase();

    const unique = new Set();
    source.forEach((hotel) => {
      const cityLabel = typeof hotel?.city === 'string' ? hotel.city.trim() : '';
      const locationLabel = typeof hotel?.location === 'string' ? hotel.location.trim() : '';
      if (cityLabel) unique.add(cityLabel);
      if (locationLabel) unique.add(locationLabel);
    });

    const allLabels = Array.from(unique);
    if (!typed) return allLabels.slice(0, 8);

    return allLabels
      .filter((label) => label.toLowerCase().includes(typed))
      .slice(0, 8);
  }, [searchCatalog, hotels, searchForm.city]);

  const featuredHotel = hotels[0] || null;
  const secondaryHotels = hotels.slice(1, 3);

  const featuredImage = parsePhotos(featuredHotel?.photos)[0] || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d';

  const onSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.city.trim()) params.set('city', searchForm.city.trim());
    if (searchForm.checkIn) params.set('checkIn', searchForm.checkIn);
    if (searchForm.checkOut) params.set('checkOut', searchForm.checkOut);
    params.set('guests', String(searchForm.guests));
    params.set('rooms', String(searchForm.rooms));
    params.set('page', '1');

    navigate(`/hotels?${params.toString()}`);
  };

  const applyCitySuggestion = (value) => {
    setSearchForm((prev) => ({ ...prev, city: value }));
    setShowCitySuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const onCityInputKeyDown = (event) => {
    if (!showCitySuggestions || !citySuggestions.length) {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSearch();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % citySuggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? citySuggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeSuggestionIndex >= 0 && citySuggestions[activeSuggestionIndex]) {
        applyCitySuggestion(citySuggestions[activeSuggestionIndex]);
      } else {
        onSearch();
      }
      return;
    }

    if (event.key === 'Escape') {
      setShowCitySuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <div className="stack-lg hp-shell">
      <motion.section
        className="hp-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="hp-hero-overlay" />
        <div className="hp-hero-content">
          <span className="hp-kicker">CURATED EXPERIENCES</span>
          <h1>The World's Most Refined Sanctuaries.</h1>

          <div className="hp-search-strip">
            <div className="hp-search-city">
              <FiMapPin size={14} />
              <input
                className="hp-search-input"
                value={searchForm.city}
                onChange={(event) => {
                  setSearchForm((prev) => ({ ...prev, city: event.target.value }));
                  setShowCitySuggestions(true);
                  setActiveSuggestionIndex(-1);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => {
                  window.setTimeout(() => {
                    setShowCitySuggestions(false);
                    setActiveSuggestionIndex(-1);
                  }, 120);
                }}
                onKeyDown={onCityInputKeyDown}
                placeholder="Where are you going?"
                aria-label="Destination"
                autoComplete="off"
              />
              {showCitySuggestions && citySuggestions.length > 0 && (
                <ul className="hp-city-suggestions" role="listbox" aria-label="Destination suggestions">
                  {citySuggestions.map((suggestion, index) => (
                    <li key={suggestion} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === activeSuggestionIndex}
                        className={index === activeSuggestionIndex ? 'active' : ''}
                        onMouseDown={() => applyCitySuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <FiCalendar size={14} />
              <div className="hp-date-wrap">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={searchForm.checkIn ? dayjs(searchForm.checkIn) : null}
                    onChange={(value) => setSearchForm((prev) => ({
                      ...prev,
                      checkIn: value?.isValid?.() ? value.format('YYYY-MM-DD') : '',
                    }))}
                    format="MMM DD, YYYY"
                    disablePast
                    slots={{ openPickerIcon: FiCalendar }}
                    slotProps={{
                      popper: { className: 'hp-glass-calendar' },
                      textField: {
                        variant: 'standard',
                        placeholder: 'Check in',
                        className: 'hp-date-field',
                        InputProps: { disableUnderline: true },
                      },
                    }}
                  />
                  <span>-</span>
                  <DatePicker
                    value={searchForm.checkOut ? dayjs(searchForm.checkOut) : null}
                    onChange={(value) => setSearchForm((prev) => ({
                      ...prev,
                      checkOut: value?.isValid?.() ? value.format('YYYY-MM-DD') : '',
                    }))}
                    format="MMM DD, YYYY"
                    minDate={searchForm.checkIn ? dayjs(searchForm.checkIn) : dayjs()}
                    slots={{ openPickerIcon: FiCalendar }}
                    slotProps={{
                      popper: { className: 'hp-glass-calendar' },
                      textField: {
                        variant: 'standard',
                        placeholder: 'Check out',
                        className: 'hp-date-field',
                        InputProps: { disableUnderline: true },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <FiUsers size={14} />
              <div className="hp-guest-wrap">
                <input
                  className="hp-search-input hp-num-input"
                  type="number"
                  min="1"
                  max="20"
                  value={searchForm.guests}
                  onChange={(event) => setSearchForm((prev) => ({ ...prev, guests: Math.max(1, Number(event.target.value) || 1) }))}
                />
                <span>Guests,</span>
                <input
                  className="hp-search-input hp-num-input"
                  type="number"
                  min="1"
                  max="10"
                  value={searchForm.rooms}
                  onChange={(event) => setSearchForm((prev) => ({ ...prev, rooms: Math.max(1, Number(event.target.value) || 1) }))}
                />
                <span>Room</span>
              </div>
            </div>
            <Button onClick={onSearch} variant="contained" color="primary" size="large">Search</Button>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="hp-showcase"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.42 }}
      >
        <div className="hp-section-head">
          <div>
            <span className="hp-section-kicker">SUMMER 2024 COLLECTION</span>
            <h2>Exceptional Properties for the Discerning Voyager</h2>
          </div>
          <Link to="/hotels">Explore All Stays</Link>
        </div>

        <div className="hp-feature-grid">
          {featuredHotel ? (
            <article key={featuredHotel.id} className="hp-feature-main">
              <img src={featuredImage} alt={featuredHotel.name} />
              <div className="hp-feature-main-body">
                <div className="hp-tags"><span>Boutique</span><span>Staff Pick</span></div>
                <h3>{featuredHotel.name}</h3>
                <p><FiMapPin size={13} /> {featuredHotel.location || featuredHotel.city}</p>
                <div className="hp-price-row">
                  <span>⭐ {Number(featuredHotel.rating || 4.9).toFixed(1)}</span>
                  <strong>${featuredHotel.rooms?.[0]?.price || 0}<small>/night</small></strong>
                </div>
              </div>
            </article>
          ) : (
            <article className="hp-feature-main">
              <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d" alt="Luxury stay" />
              <div className="hp-feature-main-body">
                <div className="hp-tags"><span>Boutique</span><span>Staff Pick</span></div>
                <h3>Aman Tokyo Sanctuary</h3>
                <p><FiMapPin size={13} /> Otemachi, Tokyo</p>
                <div className="hp-price-row">
                  <span>⭐ 4.9</span>
                  <strong>$840<small>/night</small></strong>
                </div>
              </div>
            </article>
          )}

          <div className="hp-feature-side">
            {secondaryHotels.map((hotel) => (
              <article key={hotel.id} className="hp-side-card">
                <img src={parsePhotos(hotel.photos)[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} alt={hotel.name} />
                <div>
                  <h3>{hotel.name}</h3>
                  <p>{hotel.city}, {hotel.location}</p>
                  <div>
                    <span>⭐ {Number(hotel.rating || 4.8).toFixed(1)}</span>
                    <strong>${hotel.rooms?.[0]?.price || 0}</strong>
                  </div>
                </div>
              </article>
            ))}

            {!secondaryHotels.length && (
              <article className="hp-side-card">
                <img src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd" alt="Boutique suite" />
                <div>
                  <h3>Hotel Plaza Athenee</h3>
                  <p>Paris, France</p>
                  <div><span>⭐ 4.8</span><strong>$1,200</strong></div>
                </div>
              </article>
            )}
          </div>
        </div>
      </motion.section>

      <section className="hp-cta">
        <div>
          <h3>Start Your Journey.</h3>
          <p>Get 15% off your first stay when you book through our mobile concierge.</p>
        </div>
        <div className="hp-cta-actions">
          <Button variant="contained" color="inherit">Claim Offer</Button>
          <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.45)' }}>Learn More</Button>
        </div>
      </section>

      <footer id="hp-footer" className="hp-footer">
        <div className="hp-footer-grid">
          <section>
            <h4>The Elevated Voyager</h4>
            <p>Redefining the standard of luxury travel since 2024. Curated stays for the modern adventurer.</p>
            <div className="hp-socials">
              <FiGlobe size={14} />
              <FiShare2 size={14} />
              <FiMail size={14} />
            </div>
          </section>

          <section>
            <h5>Company</h5>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">News</a>
          </section>

          <section>
            <h5>Support</h5>
            <a href="#">Contact Support</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">FAQ</a>
          </section>

          <section>
            <h5>Newsletter</h5>
            <p>Join our community for exclusive early access to new properties.</p>
            <div className="hp-newsletter">
              <input placeholder="Email address" />
              <Button variant="contained" color="secondary">Join</Button>
            </div>
          </section>
        </div>
        <p className="hp-copy">© 2024 The Elevated Voyager. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { FiCalendar, FiGlobe, FiMail, FiMapPin, FiSearch, FiShare2, FiUsers } from 'react-icons/fi';
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
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    api.get('/hotels?limit=3')
      .then((data) => setHotels(data?.data?.hotels || []))
      .catch(() => setHotels([]));
  }, []);

  const featuredHotel = hotels[0] || null;
  const secondaryHotels = hotels.slice(1, 3);

  const featuredImage = parsePhotos(featuredHotel?.photos)[0] || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d';

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
            <div>
              <FiMapPin size={14} />
              <span>Where are you going?</span>
            </div>
            <div>
              <FiCalendar size={14} />
              <span>Select Dates</span>
            </div>
            <div>
              <FiUsers size={14} />
              <span>2 Guests, 1 Room</span>
            </div>
            <Button component={Link} to="/hotels" variant="contained" color="primary" size="large">Search</Button>
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

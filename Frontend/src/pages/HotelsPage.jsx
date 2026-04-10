import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Chip, Slider, Stack } from '@mui/material';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiHeart, FiMapPin, FiSliders } from 'react-icons/fi';
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

function inferPropertyType(hotel) {
  const combined = `${hotel?.name || ''} ${hotel?.description || ''}`.toLowerCase();
  if (combined.includes('apartment') || combined.includes('residence')) return 'Apartments';
  if (combined.includes('resort')) return 'Resorts';
  if (combined.includes('villa')) return 'Villas';
  return 'Hotels';
}

function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [priceRange, setPriceRange] = useState([50, 450]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');

  const city = searchParams.get('city') || '';
  const page = Math.max(Number(searchParams.get('page') || 1), 1);
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = Math.max(Number(searchParams.get('guests') || 2), 1);
  const rooms = Math.max(Number(searchParams.get('rooms') || 1), 1);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (city) p.set('city', city);
    p.set('limit', String(pagination.limit));
    p.set('page', String(page));
    return p.toString();
  }, [city, page, pagination.limit]);

  useEffect(() => {
    setLoading(true);
    api.get(`/hotels?${query}`)
      .then((data) => {
        setHotels(data?.data?.hotels || []);
        setPagination((prev) => ({
          ...prev,
          ...(data?.pagination || {}),
        }));
      })
      .finally(() => setLoading(false));
  }, [query]);

  const normalizedHotels = useMemo(() => {
    return hotels.map((hotel) => {
      const roomPrices = (hotel.rooms || []).map((room) => Number(room.price || 0)).filter((price) => price > 0);
      const minPrice = roomPrices.length ? Math.min(...roomPrices) : 0;
      const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
      return {
        ...hotel,
        minPrice,
        propertyType: inferPropertyType(hotel),
        normalizedAmenities: amenities,
      };
    });
  }, [hotels]);

  const priceBounds = useMemo(() => {
    const prices = normalizedHotels.map((hotel) => hotel.minPrice).filter((value) => value > 0);
    if (!prices.length) return { min: 50, max: 450 };
    const min = Math.floor(Math.min(...prices) / 10) * 10;
    const max = Math.ceil(Math.max(...prices) / 10) * 10;
    return {
      min: Math.max(0, min),
      max: Math.max(min + 10, max),
    };
  }, [normalizedHotels]);

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  const amenityOptions = useMemo(() => {
    const seen = new Set();
    normalizedHotels.forEach((hotel) => {
      (hotel.normalizedAmenities || []).forEach((amenity) => {
        if (typeof amenity === 'string' && amenity.trim()) {
          seen.add(amenity.trim());
        }
      });
    });
    return Array.from(seen).slice(0, 10);
  }, [normalizedHotels]);

  const propertyTypeOptions = useMemo(() => {
    const discovered = Array.from(new Set(normalizedHotels.map((hotel) => hotel.propertyType)));
    if (!discovered.length) return ['Hotels', 'Apartments', 'Resorts', 'Villas'];
    return discovered;
  }, [normalizedHotels]);

  const filteredHotels = useMemo(() => {
    const [minSelected, maxSelected] = priceRange;
    return normalizedHotels
      .filter((hotel) => {
        if (hotel.minPrice > 0 && (hotel.minPrice < minSelected || hotel.minPrice > maxSelected)) {
          return false;
        }

        if (selectedStars.length) {
          const wholeStar = Math.floor(Number(hotel.rating || 0));
          if (!selectedStars.includes(wholeStar)) {
            return false;
          }
        }

        if (selectedAmenities.length) {
          const hasAll = selectedAmenities.every((amenity) => hotel.normalizedAmenities.includes(amenity));
          if (!hasAll) return false;
        }

        if (selectedPropertyTypes.length && !selectedPropertyTypes.includes(hotel.propertyType)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.minPrice - b.minPrice;
        if (sortBy === 'price-high') return b.minPrice - a.minPrice;
        if (sortBy === 'rating-high') return Number(b.rating || 0) - Number(a.rating || 0);
        if (sortBy === 'name-asc') return String(a.name || '').localeCompare(String(b.name || ''));
        return Number(b.rating || 0) - Number(a.rating || 0);
      });
  }, [normalizedHotels, priceRange, selectedStars, selectedAmenities, selectedPropertyTypes, sortBy]);

  const toggleInList = (value, setList) => {
    setList((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const clearFilters = () => {
    setSelectedStars([]);
    setSelectedAmenities([]);
    setSelectedPropertyTypes([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const openCityOnMap = () => {
    const target = city || shownCity;
    const encoded = encodeURIComponent(target);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const shownCity = city || 'London';
  const totalHotelsFound = pagination.total || hotels.length;
  const dateSummary = checkIn && checkOut ? `${checkIn} - ${checkOut}` : 'Select Dates';
  const computedTotalPages = useMemo(() => {
    if (pagination.totalPages) return pagination.totalPages;
    const limit = Number(pagination.limit || 6);
    const total = Number(pagination.total || 0);
    return Math.max(Math.ceil(total / Math.max(limit, 1)), 1);
  }, [pagination]);

  const pageButtons = useMemo(() => {
    const totalPages = Math.max(computedTotalPages || 1, 1);
    const current = Math.min(page, totalPages);

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 'ellipsis', totalPages];
    }

    if (current >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 'ellipsis', current, 'ellipsis', totalPages];
  }, [page, computedTotalPages]);

  const updatePage = (nextPage) => {
    const totalPages = Math.max(computedTotalPages || 1, 1);
    const safePage = Math.max(1, Math.min(nextPage, totalPages));

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(safePage));
    setSearchParams(nextParams);
  };

  return (
    <div className="stack-lg hl-shell">
      <header className="hl-head">
        <p>Destinations <span>›</span> United Kingdom <span>›</span> {shownCity}</p>
        <h1>{totalHotelsFound} hotels found in {shownCity}</h1>
        <small>{dateSummary} • {guests} Guests • {rooms} Room{rooms > 1 ? 's' : ''}</small>
      </header>

      <div className="hl-layout">
        <aside className="hl-filter-panel">
          <div className="hl-map-card">
            <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df" alt="Map view" />
            <button type="button" onClick={openCityOnMap}>Show on Map</button>
          </div>

          <div className="hl-filter-block">
            <h4>Price Range</h4>
            <div className="hl-price-slider">
              <Slider
                value={priceRange}
                onChange={(_, nextValue) => setPriceRange(nextValue)}
                min={priceBounds.min}
                max={priceBounds.max}
                valueLabelDisplay="auto"
                disableSwap
              />
            </div>
            <div className="hl-price-row"><small>£{priceRange[0]}</small><small>£{priceRange[1]}+</small></div>
          </div>

          <div className="hl-filter-block">
            <h4>Star Rating</h4>
            <div className="hl-filter-chip-set">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`hl-filter-chip ${selectedStars.includes(star) ? 'active' : ''}`}
                  onClick={() => toggleInList(star, setSelectedStars)}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          <div className="hl-filter-block">
            <h4>Amenities</h4>
            <div className="hl-filter-chip-set">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  className={`hl-filter-chip ${selectedAmenities.includes(amenity) ? 'active' : ''}`}
                  onClick={() => toggleInList(amenity, setSelectedAmenities)}
                >
                  {formatAmenityLabel(amenity)}
                </button>
              ))}
            </div>
          </div>

          <div className="hl-filter-block">
            <h4>Property Type</h4>
            <div className="hl-filter-chip-set">
              {propertyTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`hl-filter-chip ${selectedPropertyTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => toggleInList(type, setSelectedPropertyTypes)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="hl-filter-actions">
            <button type="button" onClick={clearFilters}>Reset Filters</button>
          </div>
        </aside>

        <section className="hl-results-zone">
          <div className="hl-sort-row">
            <label>
              <FiSliders size={13} />
              <span>Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popularity">Popularity</option>
                <option value="rating-high">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <FiChevronDown size={13} />
            </label>
          </div>

          {loading ? <p>Loading hotels...</p> : (
            <div className="hl-list">
              {filteredHotels.map((hotel, index) => {
                const photos = parsePhotos(hotel.photos);
                const image = photos[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
                const firstPrice = Number(hotel.rooms?.[0]?.price || 0);

                const badgeText = index === 0 ? 'Premium Selection' : index === 1 ? 'Top Rated' : 'Best Value';
                const ratingTag = index === 0 ? 'Excellent' : index === 1 ? 'Superb' : 'Very Good';

                return (
                  <article key={hotel.id} className="hl-listing-card">
                    <div className="hl-image-wrap">
                      <img src={image} alt={hotel.name} />
                      <span><FiHeart size={14} /></span>
                    </div>

                    <div className="hl-info-wrap">
                      <div className="hl-card-top">
                        <small>{badgeText}</small>
                        <div><label>{ratingTag}</label><strong>{Number(hotel.rating || 4.8).toFixed(1)}</strong></div>
                      </div>

                      <h3>{hotel.name}</h3>
                      <p><FiMapPin size={12} /> {hotel.location || hotel.city} • 0.2 miles from center</p>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="hl-chip-row">
                        {(hotel.amenities || []).slice(0, 3).map((a) => <Chip key={a} label={formatAmenityLabel(a)} size="small" />)}
                      </Stack>

                      <div className="hl-card-bottom">
                        <div>
                          <span>£{Math.max(80, Math.round(firstPrice * 1.2))}</span>
                          <strong>£{Math.round(firstPrice)}</strong>
                          <small>/night</small>
                        </div>
                        <Button component={Link} to={`/hotels/${hotel.id}`} variant="contained" color="secondary">View Details</Button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {!filteredHotels.length && (
                <article className="hl-listing-card hl-listing-empty">
                  <div className="hl-info-wrap">
                    <h3>No matches for selected filters</h3>
                    <p>Try widening your price range or removing one of the selected filters.</p>
                    <Button variant="outlined" color="inherit" onClick={clearFilters}>Clear Filters</Button>
                  </div>
                </article>
              )}
            </div>
          )}

          <div className="hl-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updatePage(page - 1)}
              aria-label="Previous page"
            >
              <FiChevronLeft size={14} />
            </button>

            {pageButtons.map((item, idx) => (
              item === 'ellipsis' ? (
                <button key={`ellipsis-${idx}`} type="button" disabled className="ellipsis">…</button>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={item === page ? 'active' : ''}
                  onClick={() => updatePage(Number(item))}
                >
                  {item}
                </button>
              )
            ))}

            <button
              type="button"
              disabled={page >= Math.max(computedTotalPages || 1, 1)}
              onClick={() => updatePage(page + 1)}
              aria-label="Next page"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </section>
      </div>

      <footer className="hl-footer">
        <div className="hl-footer-grid">
          <section>
            <h4>The Elevated Voyager</h4>
            <p>Curating exceptional stays for the discerning traveler. Beyond booking, we provide hospitality-first editorial experiences.</p>
          </section>
          <section>
            <h5>Company</h5>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Contact</a>
          </section>
          <section>
            <h5>Support</h5>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">FAQ</a>
            <a href="#">Help Center</a>
          </section>
          <section>
            <h5>Newsletter</h5>
            <p>Stay updated with our curated hotel lists and travel guides.</p>
            <div className="hl-newsletter">
              <input value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Your email" />
              <button type="button">Subscribe</button>
            </div>
          </section>
        </div>
        <p>© 2024 The Elevated Voyager. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HotelsPage;

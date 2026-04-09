import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { FiArrowLeft, FiImage, FiInfo, FiMapPin, FiStar, FiUpload } from 'react-icons/fi';
import { api } from '../lib/api';

const CLASSIFICATIONS = [
  { label: '3-Star Classic', value: '3-star', rating: 3.9 },
  { label: '4-Star Signature', value: '4-star', rating: 4.4 },
  { label: '5-Star Platinum', value: '5-star', rating: 4.8 },
];

const AMENITY_OPTIONS = [
  'Infinity Pool',
  'Private Spa',
  'Michelin Star',
  'Wine Cellar',
  'Beach Access',
  'Personal Butler',
];

function AdminCreateHotelPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [hotelForm, setHotelForm] = useState({
    name: '',
    city: '',
    location: '',
    description: '',
    classification: '5-star',
    rating: 4.8,
    amenities: [],
    coverPhoto: '',
    extraPhotos: '',
    videoUrl: '',
    geocode: '40.6281 N, 14.4850 E',
  });

  const classificationLabel = useMemo(() => {
    const item = CLASSIFICATIONS.find((entry) => entry.value === hotelForm.classification);
    return item?.label || '5-Star Platinum';
  }, [hotelForm.classification]);

  const setField = (field) => (event) => {
    const { value } = event.target;

    if (field === 'classification') {
      const selected = CLASSIFICATIONS.find((entry) => entry.value === value);
      setHotelForm((prev) => ({
        ...prev,
        classification: value,
        rating: selected?.rating ?? prev.rating,
      }));
      return;
    }

    setHotelForm((prev) => ({ ...prev, [field]: value }));
  };

  const onCoverUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleAmenity = (amenity) => {
    setHotelForm((prev) => {
      const hasAmenity = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: hasAmenity
          ? prev.amenities.filter((item) => item !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const onCreateHotel = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const photoList = [
        hotelForm.coverPhoto,
        ...hotelForm.extraPhotos.split(',').map((item) => item.trim()),
      ].filter(Boolean);

      await api.post('/admin/hotels', {
        name: hotelForm.name,
        city: hotelForm.city,
        location: hotelForm.location,
        description: hotelForm.description,
        amenities: hotelForm.amenities,
        photos: photoList,
        rating: Number(hotelForm.rating),
      });

      setMessage('Hotel created successfully.');
      setCoverPreview('');
      setHotelForm({
        name: '',
        city: '',
        location: '',
        description: '',
        classification: '5-star',
        rating: 4.8,
        amenities: [],
        coverPhoto: '',
        extraPhotos: '',
        videoUrl: '',
        geocode: '40.6281 N, 14.4850 E',
      });
    } catch (err) {
      setError(err.message || 'Failed to create hotel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="acf-shell">
      <div className="acf-head">
        <div>
          <h1>Add Property</h1>
          <p>Define a new sanctuary within The Elevated Voyager collection.</p>
        </div>
        <Button component={Link} to="/admin/manage-hotels" variant="text" startIcon={<FiArrowLeft />}>
          Back
        </Button>
      </div>

      <form className="acf-grid" onSubmit={onCreateHotel}>
        <div className="acf-left">
          <article className="acf-card">
            <h3><FiInfo size={14} /> Essential Information</h3>

            <label>Hotel Name</label>
            <TextField value={hotelForm.name} onChange={setField('name')} placeholder="e.g. The Azure Horizon Retreat" required fullWidth />

            <div className="acf-two-cols">
              <div>
                <label>City/Region</label>
                <TextField value={hotelForm.city} onChange={setField('city')} placeholder="e.g. Amalfi Coast" required fullWidth />
              </div>
              <div>
                <label>Classification</label>
                <TextField value={hotelForm.classification} onChange={setField('classification')} select fullWidth>
                  {CLASSIFICATIONS.map((item) => (
                    <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                  ))}
                </TextField>
              </div>
            </div>

            <label>Full Address</label>
            <TextField value={hotelForm.location} onChange={setField('location')} placeholder="Via Cristoforo Colombo..." required fullWidth />

            <label>Property Narrative</label>
            <TextField
              value={hotelForm.description}
              onChange={setField('description')}
              placeholder="Craft a compelling story for this property..."
              multiline
              minRows={5}
              fullWidth
            />
          </article>

          <article className="acf-card">
            <h3><FiStar size={14} /> Key Amenities</h3>

            <div className="acf-amenities">
              {AMENITY_OPTIONS.map((amenity) => {
                const active = hotelForm.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    className={active ? 'active' : ''}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    <span /> {amenity}
                  </button>
                );
              })}
            </div>
          </article>
        </div>

        <div className="acf-right">
          <article className="acf-card">
            <h3><FiImage size={14} /> Media Gallery</h3>

            <div className="acf-media-grid">
              <div className="acf-preview">
                {coverPreview || hotelForm.coverPhoto ? (
                  <img src={coverPreview || hotelForm.coverPhoto} alt="Cover preview" />
                ) : (
                  <div>Cover Preview</div>
                )}
              </div>

              <label className="acf-upload-tile">
                <input type="file" accept="image/*" onChange={onCoverUpload} />
                <FiUpload size={17} />
                <span>Upload Photo</span>
              </label>
            </div>

            <label>Primary Photo URL</label>
            <TextField value={hotelForm.coverPhoto} onChange={setField('coverPhoto')} placeholder="https://image.example.com/cover.jpg" fullWidth />

            <label>Video Showcase URL</label>
            <TextField value={hotelForm.videoUrl} onChange={setField('videoUrl')} placeholder="https://vimeo.com/12345" fullWidth />

            <label>Additional Photo URLs (comma-separated)</label>
            <TextField value={hotelForm.extraPhotos} onChange={setField('extraPhotos')} placeholder="https://..., https://..." fullWidth />
          </article>

          <article className="acf-card">
            <div className="acf-location-head">
              <h3><FiMapPin size={14} /> Location Validation</h3>
              <span>PIN VERIFIED</span>
            </div>

            <img
              className="acf-map"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
              alt="Location map"
            />

            <label>Geocoding</label>
            <TextField value={hotelForm.geocode} onChange={setField('geocode')} fullWidth />
          </article>
        </div>

        {error && <Alert severity="error">{error}</Alert>}
        {message && <Alert severity="success">{message}</Alert>}

        <Stack direction="row" spacing={1} className="acf-actions">
          <Button type="submit" variant="contained" disabled={submitting} size="large">
            {submitting ? 'Creating...' : 'Save Property'}
          </Button>
          <Button component={Link} to="/admin/manage-hotels" variant="outlined">Cancel</Button>
          <ChipLike label={`Classification: ${classificationLabel}`} />
        </Stack>
      </form>
    </section>
  );
}

function ChipLike({ label }) {
  return <span className="acf-chip">{label}</span>;
}

export default AdminCreateHotelPage;

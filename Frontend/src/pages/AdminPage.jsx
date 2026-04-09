import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

function AdminPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hotelForm, setHotelForm] = useState({
    name: '',
    city: '',
    location: '',
    description: '',
    rating: 4,
    amenities: '',
    photos: '',
  });

  if (user?.role !== 'ADMIN') {
    return <p className="error-text">Admin access only.</p>;
  }

  const onCreateHotel = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/admin/hotels', {
        ...hotelForm,
        amenities: hotelForm.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        photos: hotelForm.photos.split(',').map((item) => item.trim()).filter(Boolean),
        rating: Number(hotelForm.rating),
      });
      setMessage('Hotel created successfully.');
      setHotelForm({
        name: '', city: '', location: '', description: '', rating: 4, amenities: '', photos: '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack-lg narrow">
      <h1>Admin Panel</h1>
      <form className="booking-form" onSubmit={onCreateHotel}>
        <TextField label="Hotel Name" placeholder="Hotel Name" value={hotelForm.name} onChange={(e) => setHotelForm((p) => ({ ...p, name: e.target.value }))} required fullWidth />
        <TextField label="City" placeholder="City" value={hotelForm.city} onChange={(e) => setHotelForm((p) => ({ ...p, city: e.target.value }))} required fullWidth />
        <TextField label="Location" placeholder="Location" value={hotelForm.location} onChange={(e) => setHotelForm((p) => ({ ...p, location: e.target.value }))} required fullWidth />
        <TextField multiline minRows={4} label="Description" placeholder="Description" value={hotelForm.description} onChange={(e) => setHotelForm((p) => ({ ...p, description: e.target.value }))} fullWidth />
        <TextField type="number" inputProps={{ min: 0, max: 5, step: 0.1 }} label="Rating" placeholder="Rating" value={hotelForm.rating} onChange={(e) => setHotelForm((p) => ({ ...p, rating: e.target.value }))} fullWidth />
        <TextField label="Amenities" placeholder="Amenities (comma separated)" value={hotelForm.amenities} onChange={(e) => setHotelForm((p) => ({ ...p, amenities: e.target.value }))} fullWidth />
        <TextField label="Photo URLs" placeholder="Photo URLs (comma separated)" value={hotelForm.photos} onChange={(e) => setHotelForm((p) => ({ ...p, photos: e.target.value }))} fullWidth />

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        <Button variant="contained" color="primary" type="submit">Create Hotel</Button>
      </form>
    </div>
  );
}

export default AdminPage;

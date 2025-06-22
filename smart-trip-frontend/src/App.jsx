import { useState, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import './App.css';
import { decodePolyline } from './utils/googleApiUtils';

const libraries = ['places'];

function App() {
  const [formData, setFormData] = useState({
    startLocation: '',
    destination: '',
    duration: '',
    preferences: '',
  });
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const GOOGLE_API_KEY = 'AIzaSyDD-w41p1hY3IVjEg_jTCkpP6b3Am7zkf4';

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setTripData(null);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/trip', formData);
      setTripData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const center = useMemo(() => {
    if (!tripData) return { lat: 15.2993, lng: 74.1240 }; // Default: Goa
    const allPoints = [
      tripData.startCoords,
      ...tripData.attractions.map((a) => ({
        lat: a.geometry.location.lat,
        lng: a.geometry.location.lng,
      })),
    ];
    const avgLat = allPoints.reduce((sum, pt) => sum + pt.lat, 0) / allPoints.length;
    const avgLng = allPoints.reduce((sum, pt) => sum + pt.lng, 0) / allPoints.length;
    return { lat: avgLat, lng: avgLng };
  }, [tripData]);

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <div className="app">
      <h1>Smart Trip Planner</h1>

      <form onSubmit={handleSubmit} className="trip-form">
        <input name="startLocation" placeholder="Start Location" value={formData.startLocation} onChange={handleChange} required />
        <input name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} required />
        <input name="duration" type="number" placeholder="Duration (days)" value={formData.duration} onChange={handleChange} required />
        <input name="preferences" placeholder="Preferences (e.g., beaches, temples, ...)" value={formData.preferences} onChange={handleChange} />
        <button type="submit" disabled={loading}>{loading ? 'Planning...' : 'Plan Trip'}</button>
      </form>

      {loading && <div className="spinner">Loading...</div>}
      {error && <p className="error">{error}</p>}

      {tripData && (
        <div className="trip-display">
          <h2>Trip from {tripData.startLocation} to {tripData.destination}</h2>
          <h3>Itinerary</h3>
          {tripData.days.map((day) => (
            <div key={day.day} className="day">
              <h4>Day {day.day}</h4>
              <ul>{day.activities.map((a, i) => <li key={i}>{a}</li>)}</ul>
              <p><strong>Food:</strong> {day.food}</p>
            </div>
          ))}
          <h3>Stay</h3>
          <p>{tripData.stay}</p>
          <h3>Route Map</h3>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '400px' }}
            center={center}
            zoom={6}
          >
            <Marker
              position={tripData.startCoords}
              label={{ text: "S", color: "white", fontWeight: "bold" }}
              title={tripData.startLocation}
            />
            {tripData.attractions.map((a, i) => (
              <Marker
                key={i}
                position={{ lat: a.geometry.location.lat, lng: a.geometry.location.lng }}
                label={{ text: `${i + 1}`, color: "white", fontWeight: "bold" }}
                title={a.name}
              />
            ))}
            {tripData.route && (
              <Polyline
                path={decodePolyline(tripData.route)}
                options={{ strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2 }}
              />
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  );
}

export default App;
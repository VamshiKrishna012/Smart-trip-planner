const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;
const API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your API key

app.use(express.json());
app.use(cors());

app.post('/api/trip', async (req, res) => {
  const { startLocation, destination, duration, budget, preferences } = req.body;

  if (!startLocation || !destination || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Geocode start location
    const startGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(startLocation)}&key=${API_KEY}`;
    const startGeocodeResponse = await axios.get(startGeocodeUrl);
    if (startGeocodeResponse.data.status !== 'OK') {
      throw new Error(`Start location geocoding failed: ${startGeocodeResponse.data.status}`);
    }
    const startCoords = startGeocodeResponse.data.results[0].geometry.location;

    // Geocode destination
    const destGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${API_KEY}`;
    const destGeocodeResponse = await axios.get(destGeocodeUrl);
    if (destGeocodeResponse.data.status !== 'OK') {
      throw new Error(`Destination geocoding failed: ${destGeocodeResponse.data.status}`);
    }
    const destinationCoords = destGeocodeResponse.data.results[0].geometry.location;

    // Fetch attractions
    const attractionsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${destinationCoords.lat},${destinationCoords.lng}&radius=50000&keyword=${encodeURIComponent(preferences || 'tourist attractions')}&key=${API_KEY}`;
    const attractionsResponse = await axios.get(attractionsUrl);
    if (attractionsResponse.data.status !== 'OK') {
      throw new Error(`Attractions search failed: ${attractionsResponse.data.status}`);
    }
    const attractions = attractionsResponse.data.results.slice(0, duration * 2);
    const sortedAttractions = [...attractions].sort((a, b) => a.geometry.location.lat - b.geometry.location.lat);

    // Fetch restaurants
    const restaurantsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${destinationCoords.lat},${destinationCoords.lng}&radius=50000&keyword=restaurants&key=${API_KEY}`;
    const restaurantsResponse = await axios.get(restaurantsUrl);
    if (restaurantsResponse.data.status !== 'OK') {
      throw new Error(`Restaurants search failed: ${restaurantsResponse.data.status}`);
    }
    const restaurants = restaurantsResponse.data.results.slice(0, duration);

    // Fetch hotel
    const hotelsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${destinationCoords.lat},${destinationCoords.lng}&radius=50000&keyword=hotels&key=${API_KEY}`;
    const hotelsResponse = await axios.get(hotelsUrl);
    if (hotelsResponse.data.status !== 'OK') {
      throw new Error(`Hotels search failed: ${hotelsResponse.data.status}`);
    }
    const hotel = hotelsResponse.data.results[0];

    // Fetch directions with waypoints
    const waypoints = sortedAttractions.map(place => `${place.geometry.location.lat},${place.geometry.location.lng}`).join('|');
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&optimizeWaypoints=true&key=${API_KEY}`;
    const directionsResponse = await axios.get(directionsUrl, { timeout: 10000 });
    if (directionsResponse.data.status !== 'OK') {
      throw new Error(`Directions API failed: ${directionsResponse.data.status}`);
    }

    // Generate itinerary
    const days = Array.from({ length: parseInt(duration) }, (_, i) => ({
      day: i + 1,
      activities: [
        sortedAttractions[i * 2]?.name ? `Visit ${sortedAttractions[i * 2].name}` : 'Explore a local spot',
        sortedAttractions[i * 2 + 1]?.name ? `Visit ${sortedAttractions[i * 2 + 1].name}` : 'Relax or explore more',
      ],
      food: restaurants[i]?.name ? `Dine at ${restaurants[i].name}` : 'Try local cuisine',
    }));

    res.json({
      startLocation,
      destination,
      days,
      stay: hotel?.name ? `Stay at ${hotel.name}` : 'Find local lodging',
      route: directionsResponse.data.routes[0].overview_polyline.points,
      startCoords,
      attractions: sortedAttractions.map(attr => ({
        name: attr.name,
        geometry: attr.geometry,
      })),
    });
  } catch (error) {
    console.error('Error generating trip:', {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : null,
    });
    res.status(500).json({ error: 'Failed to generate trip' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

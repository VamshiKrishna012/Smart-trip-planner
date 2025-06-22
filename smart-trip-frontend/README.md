# 🧭 Smart Trip Planner

> Plan your dream trip with optimized routes, tourist attractions, food recommendations, and accommodation — all in a click!

---

## 🚀 Project Overview

**Smart Trip Planner** is a full-stack web application that takes in your travel preferences — start location, destination, duration, and interests — and builds a complete itinerary using real-time data from **Google Maps APIs**. The app provides:

* A day-by-day activity planner
* Recommended restaurants and hotels
* A route map with optimized travel paths and markers

Designed using the **MERN stack (MongoDB not yet integrated)** with a focus on smart travel automation, this project showcases strong integration skills, real-world API usage, geolocation services, and React-based dynamic interfaces.

---

## 🔧 Tech Stack

| Frontend               | Backend           | APIs & Tools                                  |
| ---------------------- | ----------------- | --------------------------------------------- |
| React.js               | Node.js + Express | Google Maps API (Geocode, Places, Directions) |
| @react-google-maps/api | Axios             | Google Places (Tourist Spots, Food, Hotels)   |
| HTML, CSS              | CORS, Body Parser | Polyline decoding                             |

---

## 🧠 Key Features & How It Works

### 1. 📥 User Inputs

Users provide:

* **Start Location**
* **Destination**
* **Duration (in days)**
* **Preferences** (e.g., beaches, temples, nature)

```jsx
<form>
  <input name="startLocation" />
  <input name="destination" />
  <input name="duration" />
  <input name="preferences" />
</form>
```

---

### 2. 🌍 Backend Trip Planner (Express.js)

**POST** `/api/trip` receives user input and:

#### a. 📍 Geocoding

* Converts `startLocation` and `destination` into latitude and longitude using **Google Geocoding API**.

#### b. 🎯 Fetching Points of Interest

* Finds top **tourist attractions** matching preferences using **Google Places API**.
* Retrieves nearby **restaurants** and **hotels**.

```js
const attractionsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=...&keyword=preferences`;
```

#### c. 🛣️ Optimized Route

* Builds a **smart route** with waypoints using **Google Directions API**, optimizing the order of attraction visits.

```js
const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?...&optimizeWaypoints=true`;
```

#### d. 📅 Generate Daily Itinerary

Distributes attractions and food recommendations across `duration` days.

#### e. 🏨 Suggest Accommodation

Picks a top-rated hotel from Google Places as a stay recommendation.

---

### 3. 🌐 Frontend Display (React.js)

#### a. 🧾 Form & State Management

* Uses React `useState`, `useCallback`, and `useMemo` for clean state control.
* Form submission triggers the backend trip generator.

#### b. 🗺️ Interactive Google Map

* Uses `@react-google-maps/api` to:

  * Display markers for start location and attractions.
  * Render route using **Polyline decoding**.

```jsx
<GoogleMap>
  <Marker position={tripData.startCoords} />
  <Polyline path={decodePolyline(tripData.route)} />
</GoogleMap>
```

#### c. 📋 Itinerary Breakdown

* Day-wise breakdown with 2 attractions + 1 restaurant per day.
* Hotel recommendation shown below the trip summary.

---

## 🗺 Example Output

> *Trip from Hyderabad to Goa for 3 days, with "beaches" preference:*

* **Day 1:** Visit Baga Beach, Calangute Beach — Eat at Fisherman’s Wharf
* **Day 2:** Explore Aguada Fort, Chapora Fort — Eat at Thalassa
* **Day 3:** Relax at Palolem Beach — Eat at Martin’s Corner
* **Stay at:** Taj Resort & Convention Centre

---

## 🛠 Installation & Usage

### Backend Setup

```bash
cd project/backend
npm install
node index.js
```

### Frontend Setup

```bash
cd project/frontend
npm install
npm run dev
```

Make sure to replace `GOOGLE_API_KEY` in both frontend and backend with your own **Google Maps API Key**.

---

## 🧑‍💻 Real-World Applications

This project is highly relevant for:

* **Travel agencies & tourism startups** – automating itinerary generation.
* **Personal travel planning** – offering user-specific suggestions.
* **Trip management tools** – integrating with booking APIs or payment systems.

---

## 🚧 Future Enhancements

* Add user login & saved trips
* Integrate budget filter for hotels/restaurants
* Use MongoDB to store trip history
* Add speech-based chatbot planner (Dialogflow integration)
* Add drag-and-drop itinerary editing

---

## 📞 Contact

If you're a recruiter or tech enthusiast and would like to discuss this project further:

**Vamshi Krishna**
📧 Email: chopparivamshi48@gmail.com
🌐 Linkedin: www.linkedin.com/in/vamshikrishnac

---



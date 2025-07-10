// src/pages/FindVet.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Star, Home, Clock } from "lucide-react";
import vetHospital from "../assets/vet-hospital.jpg";
import vetClinic from "../assets/vet-clinic.jpg";
import vetDefault from "../assets/vet-default.jpg";
import { useNavigate } from "react-router-dom";

const FindVet = () => {

  const getVetCategory = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("poly") || lower.includes("gov")) {
    return { label: "Government Hospital", color: "bg-green-200 text-black-800" };
  }
  
  if (lower.includes("pharma") || lower.includes("medical")) {
    return { label: "Pharmacy", color: "bg-blue-100 text-black-700" };
  }
  return { label: "Private Vet Care", color: "bg-yellow-100 text-black-800" };
};

  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [vets, setVets] = useState([]);
  const [sortBy, setSortBy] = useState("distance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVet, setSelectedVet] = useState(null);
  const [lastFetchKey, setLastFetchKey] = useState(null);
  const [cooldownActive, setCooldownActive] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const radius = 15000; // 15 km

  useEffect(() => {
  navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    console.log("📍 Got location:", latitude, longitude);
    setUserLocation({ lat: latitude, lng: longitude });
  },
  (err) => {
    console.error("Geolocation error:", err);
    setError("Unable to access your location.");
    setLoading(false);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0 // 👈 forces fresh reading every time
  }
);

}, []);


  useEffect(() => {
    const fetchVets = async () => {
      if (!userLocation) return;

      const cacheKey = `${userLocation.lat},${userLocation.lng},${radius}`;
      const lastCalled = localStorage.getItem("lastVetAPICall");
const now = Date.now();
const oneMinute = 1 * 60 * 1000;

if (lastCalled && now - parseInt(lastCalled) < oneMinute) {
  // Use cached data during cooldown
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    setVets(JSON.parse(cached));
    setCooldownActive(true);
    setLoading(false);
    return;
  }
}

// Otherwise, make a fresh API call after cooldown


      setLoading(true);

      const endpoint = "https://places.googleapis.com/v1/places:searchNearby";
      const body = {
        includedTypes: ["veterinary_care"],
        locationRestriction: {
          circle: {
            center: {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            },
            radius,
          },
        },
      };

      try {
        const response = await axios.post(endpoint, body, {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.rating,places.photos,places.location,places.regularOpeningHours",
          },
        });

        const enrichedVets = response.data.places.map((place) => {
          const dist = getDistance(userLocation.lat, userLocation.lng, place.location.latitude, place.location.longitude);
          return { ...place, distance: dist };
        });

        sessionStorage.setItem(cacheKey, JSON.stringify(enrichedVets));
        setVets(enrichedVets);
        setLastFetchKey(cacheKey);
        localStorage.setItem("lastVetAPICall", now.toString());
      } catch (err) {
        console.error("❌ API call failed:", err);
        setError("Failed to fetch vet clinics.");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchVets();
    }, 500);

    return () => clearTimeout(debounce);
  }, [userLocation]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      (Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        (1 - Math.cos(dLon))) /
        2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const getDefaultImage = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("hospital")) return vetHospital;
    if (lower.includes("clinic")) return vetClinic;
    return vetDefault;
  };
  const getOpeningStatus = (vet) => {
  const hours = vet.regularOpeningHours?.weekdayDescriptions;
  const now = new Date();
  const currentHour = now.getHours();
  const todayIndex = now.getDay(); // Sunday = 0
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Fallback if hours are missing
  if (!hours || hours.length !== 7) {
    if (currentHour >= 9 && currentHour < 17) {
      return "9:00 AM – 5:00 PM (assumed)";
    } else {
      return "Closed now • Opens tomorrow at 9:00 AM (estimated)";
    }
  }

  // Reorder Sunday to end (Google API starts with Monday)
  const descriptions = [...hours];
  descriptions.push(descriptions.shift());

  // Get today's hours
  const todayDesc = descriptions[todayIndex === 0 ? 6 : todayIndex - 1];
  const isTodayOpen = todayDesc && !todayDesc.toLowerCase().includes("closed");

  if (isTodayOpen) {
    const timeStr = todayDesc.split(":").slice(1).join(":").trim(); // Keep full time string after the day
    if (currentHour >= 9 && currentHour < 17) {
      return `Today: ${timeStr}`;
    } else {
      return `Working Hours : ${timeStr}`;
    }
  }

  // If today is closed, find next open day
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (todayIndex + i) % 7;
    const desc = descriptions[nextIndex === 0 ? 6 : nextIndex - 1];
    if (desc && !desc.toLowerCase().includes("closed")) {
      const timeStr = desc.split(":").slice(1).join(":").trim();
      const dayName = dayNames[nextIndex];
      return `Closed today • Opens ${dayName} at ${timeStr}`;
    }
  }

  return "Closed all week";
};



 const getTodayHours = (hours) => {
  if (hours?.periods) {
    const today = new Date().getDay();
    return hours.periods?.[today]?.openTime?.text || "N/A";
  }

  const now = new Date();
  const hour = now.getHours();
  if (hour >= 9 && hour < 17) return "Open 9:00 AM – 5:00 PM (assumed)";
  return "Closed (assumed)";
};


  const isOpenNow = (hours) => {
  if (hours?.openNow !== undefined) return hours.openNow;

  // If openNow is undefined or hours is N/A, fallback to time check
  const now = new Date();
  const currentHour = now.getHours();

  return currentHour >= 9 && currentHour < 17; // 9 AM to 5 PM
};


  const sortedVets = vets.sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return a.distance - b.distance;
  });

  return (
    <div className="min-h-screen bg-orange-50 py-6 px-4 md:px-10">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Find Nearby Vets</h1>
        <button
      onClick={() => navigate("/dashboard")}
      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-full shadow flex items-center gap-1"
    >
      <Home size={18} /> Home
    </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <label className="flex items-center gap-2 text-gray-700 text-xs md:text-base">
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border bg-white rounded-full px-2 py-1 w-[120px] md:w-[180px] text-xs md:text-base shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
          </select>
        </label>
      </div>


      {loading && <p>Loading vet clinics near you...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedVets.map((vet, index) => {
          const isOpen = isOpenNow(vet.regularOpeningHours);
          const todayHours = getTodayHours(vet.regularOpeningHours);

          return (
            <div
              key={index}
  className="flex flex-col justify-between h-full relative bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Open/Closed Badge */}
              <div
                className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow ${
                  isOpen ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {isOpen ? "Open Now" : "Closed"}
              </div>

              <img
                src={getDefaultImage(vet.displayName?.text)}
                alt="Vet Default"
                className="rounded-xl mb-3 w-full object-cover h-48"
              />
              {(() => {
  const { label, color } = getVetCategory(vet.displayName?.text);
  return (
    <p className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${color} mb-2`}>
      {label}
    </p>
  );
})()}
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {vet.displayName?.text || "Unnamed Clinic"}
              </h2>
              <p className="text-gray-600 text-sm mb-1">{vet.formattedAddress}</p>
              <div className="flex justify-between items-center text-sm font-medium mb-1">
                <span className="flex items-center text-yellow-600 text-xs md:text-sm">
                  <Star className="w-4 h-4 mr-1" />
                  {vet.rating ? vet.rating.toFixed(1) : "N/A"}
                </span>
                
                <span className="flex items-center text-gray-700 text-xs md:text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {vet.distance.toFixed(2)} km
                </span>
              </div>
              
              <div className="flex items-center text-blue-800 text-xs md:text-sm">
  <Clock className="w-4 h-4 mr-1" />
  <span className="ml-1 font-semibold">{getOpeningStatus(vet)}</span>
</div>

              <button
  onClick={() => setSelectedVet(vet)}
  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-md transition duration-300 w-full"
>
  📍 View on Map
</button>

            </div>
          );
        })}
      </div>

      {/* Map Modal */}
      {selectedVet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-5xl relative">
            <button
              onClick={() => setSelectedVet(null)}
              className="absolute top-4 right-4 text-gray-700 hover:text-black text-xl z-10"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {selectedVet.displayName?.text || "Clinic Map"}
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              {selectedVet?.photos?.[0]?.name && (
                <img
                  src={`https://places.googleapis.com/v1/${selectedVet.photos[0].name}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=600`}
                  alt={selectedVet.displayName?.text}
                  className="rounded-xl w-full md:w-1/2 object-cover"
                />
              )}
              <iframe
                title="Google Map Preview"
                className="rounded-xl w-full md:w-1/2"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
                  selectedVet.formattedAddress
                )}`}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindVet;
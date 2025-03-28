import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSun, FaCloud, FaCloudRain, FaTemperatureHigh, FaTemperatureLow, FaWind } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MoonLoader } from "react-spinners"; // For loading spinner
import debounce from "lodash.debounce";
const WeatherAlerts = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");  // User input for city search
  const [unit, setUnit] = useState(localStorage.getItem("unit") || "metric");
  const [forecast, setForecast] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  
  const API_KEY = "1274d7780f57033ed9118ea96db99182";

  // Fetch city suggestions as the user types
  const fetchCitySuggestions = async (query) => {
    if (query.length < 3) return; // Fetch only after at least 3 characters
    try {
      const res = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=38%20Upper%20Montagu%20Street%2C%20Westminster%20W1H%201LJ%2C%20United%20Kingdom&apiKey=d4e5096717834628a5a85bfd293bf5da`);
      setCitySuggestions(res.data.list || []);
    } catch (err) {
      console.error("Error fetching city suggestions", err);
    }
  };

  // Get the user's location
  useEffect(() => {
    if (navigator.geolocation && !city) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (err) => {
          setError(`Failed to get location: ${err.message}`);
          setLoading(false);
        }
      );
    }
  }, [city]);

  // Fetch weather data based on location or city search
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch
      try {
        let url = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=${unit}`;
        if (location) {
          url += `&lat=${location.latitude}&lon=${location.longitude}`;
        } else if (city) {
          url += `&q=${city}`;
        }
        const res = await axios.get(url);
        setWeather(res.data);
        setLoading(false);
        toast.success("Weather data fetched successfully!");
      } catch (err) {
        setLoading(false);
        if (err.response) {
          // Handle known errors from the API response
          console.error("API Error:", err.response);
          setError("Failed to fetch weather data. Please try again later.");
          toast.error("Error fetching weather data");
        } else if (err.request) {
          // Handle network errors
          console.error("Network Error:", err.request);
          setError("Network error. Please check your connection.");
          toast.error("Network error. Please check your connection.");
        } else {
          // Handle any other errors
          console.error("Error:", err.message);
          setError("An unknown error occurred.");
          toast.error("An unknown error occurred.");
        }
      }
    };

    if (location || city) {
      fetchWeather();
    }
  }, [location, city, unit]);

  // Fetch 5-day forecast
  useEffect(() => {
    const fetchForecast = async () => {
      if (!weather) return;
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=${unit}&q=${weather.name}`;
        const res = await axios.get(url);
        setForecast(res.data);
      } catch (err) {
        console.error("Error fetching forecast data", err);
      }
    };
    fetchForecast();
  }, [weather, unit]);

  const renderWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear":
        return <FaSun className="text-yellow-500 text-8xl animate-pulse" />;
      case "Clouds":
        return <FaCloud className="text-gray-500 text-8xl" />;
      case "Rain":
        return <FaCloudRain className="text-blue-500 text-8xl" />;
      default:
        return <FaCloud className="text-gray-400 text-8xl" />;
    }
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    debounce(fetchCitySuggestions(e.target.value), 500); // Wait 500ms before API call
  };
  const handleUnitChange = (e) => {
    const selectedUnit = e.target.value;
    setUnit(selectedUnit);
    localStorage.setItem("unit", selectedUnit);
  };

  const handleCitySelect = (name) => {
    setCity(name);
    setCitySuggestions([]);  // Clear suggestions after selection
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-200 to-blue-400">
        <MoonLoader size={80} color="#1e40af" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message p-4">{error}</div>;
  }

  // Dynamic background color based on weather condition
  const weatherBg = weather ? (
    weather.weather[0].main === "Clear" ? "bg-blue-100" :
    weather.weather[0].main === "Clouds" ? "bg-gray-300" :
    weather.weather[0].main === "Rain" ? "bg-blue-300" : "bg-gray-200"
  ) : "bg-white";

  return (
    <div className={`weather-alerts min-h-screen flex flex-col justify-center items-center p-6 rounded-lg shadow-lg w-full bg-gradient-to-r from-blue-200 to-blue-400 ${weatherBg}`}>
      <h2 className="text-4xl font-semibold mb-4 text-center text-blue-800">Weather Forecast</h2>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center items-center space-x-4 w-full max-w-xl">
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Search by city..."
          className="border-2 rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
        <button
          onClick={() => setCity(city)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ease-in-out"
        >
          Search
        </button>
      </div>

      {/* Display city suggestions */}
      {citySuggestions.length > 0 && (
        <div className="suggestions-list bg-white shadow-lg rounded-lg mt-2 p-4 w-full max-w-xl">
          {citySuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => handleCitySelect(suggestion.name)}
              className="suggestion-item cursor-pointer py-2 px-4 hover:bg-gray-200 rounded-lg"
            >
              {suggestion.name}, {suggestion.sys.country}
            </div>
          ))}
        </div>
      )}

      {weather && (
        <>
          <div className="text-center mb-6">
            <h3 className="text-4xl font-bold text-blue-800">{weather.name}, {weather.sys.country}</h3>
            <p className="text-lg text-gray-600">{weather.weather[0].description}</p>
          </div>

          <div className="flex justify-center mb-6">
            {renderWeatherIcon(weather.weather[0].main)}
          </div>

          <div className="weather-details text-center space-y-4">
            <p className="text-3xl font-semibold">
              Temp: {Math.round(weather.main.temp)}°{unit === "metric" ? "C" : "F"}
            </p>
            <div className="flex justify-between">
              <p className="flex items-center">
                <FaTemperatureHigh className="mr-2 text-red-500" />
                High: {Math.round(weather.main.temp_max)}°{unit === "metric" ? "C" : "F"}
              </p>
              <p className="flex items-center">
                <FaTemperatureLow className="mr-2 text-blue-500" />
                Low: {Math.round(weather.main.temp_min)}°{unit === "metric" ? "C" : "F"}
              </p>
            </div>
            <p className="flex items-center justify-center">
              <FaWind className="mr-2 text-green-500" />
              Wind Speed: {weather.wind.speed} m/s
            </p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Pressure: {weather.main.pressure} hPa</p>
            <p>Visibility: {weather.visibility / 1000} km</p>
            <p>Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
          </div>
        </>
      )}

      {/* Unit Toggle */}
      <div className="mt-6 flex justify-center space-x-4">
        <label htmlFor="unit-toggle" className="text-lg">Unit: </label>
        <select
          id="unit-toggle"
          value={unit}
          onChange={handleUnitChange}
          className="border rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="metric">Celsius (°C)</option>
          <option value="imperial">Fahrenheit (°F)</option>
        </select>
      </div>

      {/* 5-day forecast */}
      {forecast && (
        <div className="forecast mt-8 w-full max-w-4xl">
          <h3 className="text-2xl font-semibold text-blue-800 text-center">5-Day Forecast</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {forecast.list.slice(0, 5).map((item) => (
              <div key={item.dt} className="forecast-item text-center bg-white shadow-lg rounded-lg p-6">
                <p className="text-lg font-bold">{new Date(item.dt * 1000).toLocaleDateString()}</p>
                {renderWeatherIcon(item.weather[0].main)}
                <p className="text-sm">{Math.round(item.main.temp)}°{unit === "metric" ? "C" : "F"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherAlerts;

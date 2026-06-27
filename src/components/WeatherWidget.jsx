import { useEffect, useState } from "react";
import axios from "axios";
import { FaSun, FaCloud, FaCloudRain, FaTemperatureHigh, FaTemperatureLow, FaWind } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";
import PageShell from "./ui/PageShell";
import LoadingBlock from "./ui/LoadingBlock";
import Button from "./ui/Button";
import Card from "./ui/Card";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const DEMO_CITIES = [
  { name: 'Dhanbad', country: 'IN', lat: 23.7957, lon: 86.4304, temp: 32, desc: 'Haze', main: 'Clouds', humidity: 68, wind: 2.4 },
  { name: 'Bokaro', country: 'IN', lat: 23.6693, lon: 86.1511, temp: 31, desc: 'Partly cloudy', main: 'Clouds', humidity: 62, wind: 3.1 },
  { name: 'Singrauli', country: 'IN', lat: 24.1991, lon: 82.6745, temp: 34, desc: 'Clear sky', main: 'Clear', humidity: 55, wind: 1.8 },
  { name: 'Korba', country: 'IN', lat: 22.3595, lon: 82.7501, temp: 33, desc: 'Scattered clouds', main: 'Clouds', humidity: 58, wind: 2.9 },
];

const buildDemoWeather = (cityName) => {
  const match = DEMO_CITIES.find((c) => c.name.toLowerCase() === (cityName || '').toLowerCase()) || DEMO_CITIES[0];
  const now = Math.floor(Date.now() / 1000);
  return {
    name: match.name,
    sys: { country: match.country, sunrise: now - 3600 * 4, sunset: now + 3600 * 6 },
    weather: [{ main: match.main, description: match.desc }],
    main: { temp: match.temp, temp_min: match.temp - 3, temp_max: match.temp + 4, humidity: match.humidity, pressure: 1012 },
    wind: { speed: match.wind },
    visibility: 8000,
    coord: { lat: match.lat, lon: match.lon },
    _demo: true,
  };
};

const buildDemoForecast = (cityName) => {
  const base = DEMO_CITIES.find((c) => c.name.toLowerCase() === (cityName || '').toLowerCase()) || DEMO_CITIES[0];
  const now = Date.now();
  return {
    list: Array.from({ length: 5 }, (_, i) => ({
      dt: Math.floor((now + i * 86400000) / 1000),
      main: { temp: base.temp + randOffset(i) },
      weather: [{ main: i % 2 ? 'Clouds' : 'Clear' }],
    })),
  };
};

const randOffset = (i) => (i % 2 === 0 ? 2 : -1);

const WeatherAlerts = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");  // User input for city search
  const [unit, setUnit] = useState(localStorage.getItem("unit") || "metric");
  const [forecast, setForecast] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  
  // Fetch city suggestions as the user types
  const fetchCitySuggestions = debounce(async (query) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    if (!API_KEY) {
      const names = DEMO_CITIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
      setCitySuggestions(names.map((c) => ({ name: c.name, country: c.country, lat: c.lat, lon: c.lon })));
      return;
    }
    try {
      const res = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
        params: { q: query, limit: 5, appid: API_KEY },
      });
      setCitySuggestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching city suggestions", err);
    }
  }, 400);

  // Get the user's location (only when API key is configured)
  useEffect(() => {
    if (!API_KEY || city) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        () => {
          setWeather(buildDemoWeather('Dhanbad'));
          setForecast(buildDemoForecast('Dhanbad'));
          setLoading(false);
        }
      );
    }
  }, [city]);

  // Fetch weather data based on location or city search
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      if (!API_KEY) {
        const demoCity = city || 'Dhanbad';
        setWeather(buildDemoWeather(demoCity));
        setForecast(buildDemoForecast(demoCity));
        setLoading(false);
        return;
      }
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

    if (location || city || !API_KEY) {
      fetchWeather();
    }
  }, [location, city, unit]);

  // Fetch 5-day forecast
  useEffect(() => {
    const fetchForecast = async () => {
      if (!weather || weather._demo) return;
      if (!API_KEY) return;
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
    const val = e.target.value;
    setCity(val);
    fetchCitySuggestions(val);
  };
  const handleUnitChange = (e) => {
    const selectedUnit = e.target.value;
    setUnit(selectedUnit);
    localStorage.setItem("unit", selectedUnit);
  };

  const handleCitySelect = (name) => {
    setCity(name);
    setCitySuggestions([]);
    setLocation(null);
  };

  if (loading && !weather) {
    return <LoadingBlock label="Loading weather…" />;
  }

  return (
    <PageShell title="Weather" subtitle="Conditions and forecast for mine sites" variant="dark">
      {weather?._demo && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Showing demo weather for Indian coalfield cities. Add <code className="text-amber-100">VITE_OPENWEATHER_API_KEY</code> to <code className="text-amber-100">CoalMine-F/.env</code> for live data.
        </div>
      )}
      {error && !weather?._demo && <div className="alert-banner-error mb-4">{error}</div>}

      <div className="toolbar max-w-xl">
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Search by city…"
          className="input-field flex-1"
        />
        <Button onClick={() => setCity(city)}>Search</Button>
      </div>

      {citySuggestions.length > 0 && (
        <Card className="max-w-xl mb-4 !p-2">
          {citySuggestions.map((suggestion) => (
            <button
              key={`${suggestion.lat}-${suggestion.lon}`}
              type="button"
              onClick={() => handleCitySelect(suggestion.name)}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
            >
              {suggestion.name}, {suggestion.country}
            </button>
          ))}
        </Card>
      )}

      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {weather.name}, {weather.sys.country}
              </h3>
              <p className="text-slate-500 capitalize">{weather.weather[0].description}</p>
              <div className="flex justify-center my-4">{renderWeatherIcon(weather.weather[0].main)}</div>
              <p className="text-4xl font-bold text-amber-600">
                {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <FaTemperatureHigh className="text-red-500" /> High {Math.round(weather.main.temp_max)}°
              </p>
              <p className="flex items-center gap-2">
                <FaTemperatureLow className="text-blue-500" /> Low {Math.round(weather.main.temp_min)}°
              </p>
              <p className="flex items-center gap-2">
                <FaWind className="text-emerald-500" /> {weather.wind.speed} m/s
              </p>
              <p>Humidity {weather.main.humidity}%</p>
            </div>
          </Card>
          <Card>
            <label className="text-sm font-medium text-slate-500">Units</label>
            <select id="unit-toggle" value={unit} onChange={handleUnitChange} className="input-field mt-2">
              <option value="metric">Celsius (°C)</option>
              <option value="imperial">Fahrenheit (°F)</option>
            </select>
            <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <p>Pressure: {weather.main.pressure} hPa</p>
              <p>Visibility: {(weather.visibility / 1000).toFixed(1)} km</p>
              <p>Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
              <p>Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
            </div>
          </Card>
        </div>
      )}

      {forecast && (
        <div className="mt-8">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">5-day forecast</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {forecast.list.slice(0, 5).map((item) => (
              <Card key={item.dt} hover={false} className="text-center !p-4">
                <p className="text-sm font-medium">{new Date(item.dt * 1000).toLocaleDateString()}</p>
                <div className="flex justify-center my-2 scale-75">{renderWeatherIcon(item.weather[0].main)}</div>
                <p className="text-lg font-semibold">
                  {Math.round(item.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default WeatherAlerts;

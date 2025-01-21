import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WeatherContext = createContext();

export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (city = 'Your City') => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/weather/${city}`);
      setWeather(response.data);
      setError(null);
      fetchForecast(city);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Could not fetch weather data. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (city) => {
    try {
      const response = await axios.get(`/api/weather/forecast/${city}`);
      setForecast(response.data);
    } catch (err) {
      console.error('Error fetching forecast:', err);
    }
  };

  useEffect(() => {
    fetchWeather(); // Fetch weather for default city on mount
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, forecast, loading, error, fetchWeather }}>
      {children}
    </WeatherContext.Provider>
  );
};

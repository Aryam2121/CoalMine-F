import { createContext, useContext, useState, useEffect } from 'react';

const WeatherContext = createContext();

export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider = ({ children }) => {
  const [weather] = useState(null);
  const [forecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    // Weather page uses OpenWeather directly; backend has no weather proxy.
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, forecast, loading, error, fetchWeather }}>
      {children}
    </WeatherContext.Provider>
  );
};

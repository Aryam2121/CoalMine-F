import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/axios';
import { AuthContext } from './AuthContext';

const ResourceContext = createContext();

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const fetchResources = async () => {
    if (!localStorage.getItem('token')) {
      setResources([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/getAllRes');
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('ResourceContext fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setResources([]);
      setLoading(false);
      return;
    }
    fetchResources();
  }, [isAuthenticated, authLoading]);

  return (
    <ResourceContext.Provider value={{ resources, setResources, loading, refreshResources: fetchResources }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => useContext(ResourceContext);

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { getApiBaseUrl } from '../services/axios';
import api from '../services/axios';
import { fetchOperationalMines, resolveActiveMineId } from '../utils/minesApi';

const SocketContext = createContext(null);

export const getSocketUrl = () => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/\/api\/?$/, '');
};

export function SocketProvider({ children, enabled = true }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeMineId, setActiveMineId] = useState(null);
  const [mines, setMines] = useState([]);
  const [emergency, setEmergency] = useState(null);
  const [activeEvacuation, setActiveEvacuation] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const joinedMine = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    fetchOperationalMines()
      .then((arr) => {
        setMines(arr);
        setActiveMineId((current) => resolveActiveMineId(arr, current));
      })
      .catch(() => {});

    const instance = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    instance.on('connect', () => setConnected(true));
    instance.on('disconnect', () => setConnected(false));

    instance.on('emergency:alert', (payload) => {
      setEmergency(payload?.emergency || payload);
      toast.error('🚨 EMERGENCY ALERT — Immediate action required', { autoClose: false });
    });

    instance.on('emergency:admin', (payload) => {
      setEmergency(payload?.emergency || payload);
      toast.error('🚨 Site emergency reported', { autoClose: 10000 });
    });

    instance.on('alert:new', (alert) => {
      const item = { id: alert._id || Date.now(), type: 'alert', data: alert, at: new Date() };
      setLiveNotifications((prev) => [item, ...prev].slice(0, 50));
      toast.warn(alert.message || 'New safety alert', { autoClose: 6000 });
    });

    instance.on('maintenance:created', (task) => {
      setLiveNotifications((prev) => [
        { id: task._id, type: 'maintenance', data: task, at: new Date() },
        ...prev,
      ].slice(0, 50));
    });

    instance.on('maintenance:updated', (task) => {
      setLiveNotifications((prev) => [
        { id: `${task._id}-u`, type: 'maintenance', data: task, at: new Date() },
        ...prev,
      ].slice(0, 50));
    });

    instance.on('environment:danger', (payload) => {
      toast.error(payload.message || 'Dangerous gas levels detected', { autoClose: false });
    });

    instance.on('equipment:alert', (payload) => {
      toast.warn(`Equipment alert: ${payload.equipmentId} — ${payload.status}`, { autoClose: 8000 });
    });

    instance.on('evacuation:initiated', (payload) => {
      const e = payload?.emergency || payload;
      setEmergency(e);
      setActiveEvacuation(e);
      toast.error('⚠️ EVACUATION ORDER — Proceed to muster point immediately', { autoClose: false });
    });

    instance.on('evacuation:completed', () => {
      setActiveEvacuation(null);
    });

    instance.on('muster:updated', () => {
      setLiveNotifications((prev) => [
        { id: `muster-${Date.now()}`, type: 'muster', data: {}, at: new Date() },
        ...prev,
      ].slice(0, 50));
    });

    instance.on('geofence:violation', (payload) => {
      toast.warn(payload.violations?.[0]?.message || 'Geofence violation detected', { autoClose: 8000 });
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [enabled]);

  useEffect(() => {
    if (!socket || !activeMineId || !connected) return undefined;

    if (joinedMine.current === activeMineId) return undefined;

    socket.emit('join:mine', activeMineId, (ack) => {
      if (ack?.ok) joinedMine.current = activeMineId;
    });

    return () => {
      if (joinedMine.current) {
        socket.emit('leave:mine', joinedMine.current);
        joinedMine.current = null;
      }
    };
  }, [socket, activeMineId, connected]);

  const dismissEmergency = useCallback(() => setEmergency(null), []);

  const sendChat = useCallback(
    (message, channel = 'general') => {
      if (!socket || !activeMineId) return false;
      socket.emit('chat:message', { mineId: activeMineId, message, channel });
      return true;
    },
    [socket, activeMineId]
  );

  const sendLocationUpdate = useCallback(
    (location, vitalSigns) => {
      if (!socket || !activeMineId) return;
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('location:update', {
        mineId: activeMineId,
        userId: user._id || user.id,
        location,
        vitalSigns,
      });
    },
    [socket, activeMineId]
  );

  const value = {
    socket,
    connected,
    activeMineId,
    setActiveMineId,
    mines,
    emergency,
    activeEvacuation,
    setActiveEvacuation,
    dismissEmergency,
    liveNotifications,
    setLiveNotifications,
    sendChat,
    sendLocationUpdate,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider');
  return ctx;
};

export default SocketContext;

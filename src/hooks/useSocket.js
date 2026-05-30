import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from '../services/axios';

export const getSocketUrl = () => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/\/api\/?$/, '');
};

/**
 * Connects to the backend Socket.IO server when a JWT is present.
 */
export function useSocket(enabled = true) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const token = localStorage.getItem('token');
    if (!token) return undefined;

    const instance = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 8,
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    instance.on('connect', onConnect);
    instance.on('disconnect', onDisconnect);
    setSocket(instance);

    if (instance.connected) setConnected(true);

    return () => {
      instance.off('connect', onConnect);
      instance.off('disconnect', onDisconnect);
      instance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [enabled]);

  return { socket, connected };
}

export default useSocket;

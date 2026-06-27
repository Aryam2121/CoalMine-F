import api from '../services/axios';
import { requestNotificationPermission } from '../firebaseConfig';

export const registerPushToken = async () => {
  try {
    const token = await requestNotificationPermission();
    if (!token) return null;
    await api.post('/notifications/register-token', { token });
    localStorage.setItem('fcmToken', token);
    return token;
  } catch {
    return null;
  }
};

export default registerPushToken;

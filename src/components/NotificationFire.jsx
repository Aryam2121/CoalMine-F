import React, { useEffect, useState } from "react";
import { requestNotificationPermission, onMessageListener } from "../firebaseConfig";
import axios from "axios";

const NotificationsFire = () => {
  const [token, setToken] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    requestNotificationPermission().then((fcmToken) => {
      if (fcmToken) {
        setToken(fcmToken);
      }
    });

    onMessageListener().then((payload) => {
      setNotifications((prev) => [...prev, payload.notification]);
    });
  }, []);

  const sendNotification = async () => {
    if (!token) {
      alert("No FCM Token found. Please enable notifications.");
      return;
    }

    const notificationData = {
      title: "Safety Alert!",
      body: "A critical hazard has been detected in Zone 3.",
      token: token,
    };

    try {
      await axios.post("http://localhost:5000/api/notifications/send-notification", notificationData);
      alert("Notification Sent!");
    } catch (error) {
      console.error("Error sending notification", error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-lg max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Real-Time Notifications</h2>

      <button
        onClick={sendNotification}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Send Test Alert
      </button>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Alerts</h3>
        <ul className="mt-2">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <li key={index} className="p-2 bg-white rounded-md shadow-md mb-2">
                <strong>{notif.title}</strong>: {notif.body}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No notifications yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsFire;

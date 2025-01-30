import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDFoBUlTFIxdy9o6zvpAAUGRp_lDLJdnTU",
    authDomain: "coal-mines-e70ae.firebaseapp.com",
    projectId: "coal-mines-e70ae",
    storageBucket: "coal-mines-e70ae.firebasestorage.app",
    messagingSenderId: "583104828116",
    appId: "1:583104828116:web:11837737e608bcb8862141",
    measurementId: "G-47J4081SXE"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission for notifications
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: "BD0bKqJ-QIjUzZfKUsQuaQL0IX8uhf4OwGOxU4vwdz-2l2D53cZykCq-aXKcZAUITSNIXhrXWrNyxp8H7f3UA1g" });
      console.log("FCM Token:", token);
      return token;
    }
  } catch (error) {
    console.error("Permission denied", error);
  }
};

// Listen for messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default messaging;

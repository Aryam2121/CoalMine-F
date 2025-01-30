/* eslint-disable no-undef */
/* eslint-env serviceworker */
importScripts("https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyDFoBUlTFIxdy9o6zvpAAUGRp_lDLJdnTU",
    authDomain: "coal-mines-e70ae.firebaseapp.com",
    projectId: "coal-mines-e70ae",
    storageBucket: "coal-mines-e70ae.firebasestorage.app",
    messagingSenderId: "583104828116",
    appId: "1:583104828116:web:11837737e608bcb8862141",
    measurementId: "G-47J4081SXE"

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});

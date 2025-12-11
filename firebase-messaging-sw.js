// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (keep in sync with your main page)
const firebaseConfig = {
    apiKey: "AIzaSyB5r_KL2eKVFd66VQU_5pznKrVHa9xzCfc",
    authDomain: "joespick5push.firebaseapp.com",
    projectId: "joespick5push",
    storageBucket: "joespick5push.firebasestorage.app",
    messagingSenderId: "783669343677",
    appId: "1:783669343677:web:d3a43a1a58b920ba9a4ed4",
    measurementId: "G-HNPLN4XZ44"
};

// Init
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages (show a notification when page is closed)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'Notification';
  const notificationOptions = {
    body: (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || '',
    icon: (payload.notification && payload.notification.icon) || (payload.data && payload.data.icon) || '/favicon.ico',
    data: {
      // keep payload.data.url if present, otherwise will use default click target below
      url: (payload.data && payload.data.url) || ''
    }
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click - open/ focus your chosen URL
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.', event);
  event.notification.close();

  // You indicated you want this URL opened when notifications are clicked:
  const forcedUrl = 'https://joespicks.github.io/';

  // If payload provided url and you later want to prefer that, you can use:
  // const payloadUrl = event.notification && event.notification.data && event.notification.data.url;
  // const urlToOpen = payloadUrl && payloadUrl.length ? payloadUrl : forcedUrl;

  const urlToOpen = forcedUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let client of clientList) {
        try {
          // Compare normalized absolute urls
          if (client.url === urlToOpen || client.url === new URL(urlToOpen).href) {
            return client.focus();
          }
        } catch (err) {
          // If comparison fails (cross-origin), ignore and continue
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

// pushsubscriptionchange: attempt to notify pages to refresh tokens
self.addEventListener('pushsubscriptionchange', event => {
  console.log('[firebase-messaging-sw.js] pushsubscriptionchange event', event);
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        clientList.forEach(client => {
          client.postMessage({ type: 'tokenRefresh' });
        });
      })
  );
});

// Basic lifecycle handlers
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  // Take control of uncontrolled clients immediately
  event.waitUntil(self.clients.claim());
});

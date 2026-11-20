self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "لافازا";
  const options = {
    body: data.body || "لديك تحديث جديد.",
    icon: "/pwa-icon.png",
    badge: "/pwa-icon.png",
    tag: data.tag || "lavaza-notification",
    renotify: true,
    data: {
      url: data.url || "/orders",
    },
  };

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const ordersUrl = new URL("/orders", self.location.origin).href;
      const focusedClient = clients.find(
        (client) =>
          client.url.startsWith(ordersUrl) &&
          client.visibilityState === "visible" &&
          client.focused,
      );

      if (focusedClient) {
        focusedClient?.postMessage({
          type: "LAVAZA_ORDER_PUSH",
          orderId: data.orderId,
        });
        return undefined;
      }
      return self.registration.showNotification(title, options);
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || "/orders",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }

      return self.clients.openWindow(target);
    }),
  );
});

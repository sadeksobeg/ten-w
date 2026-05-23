self.addEventListener("push", (event) => {
  const data = event.data?.json?.() ?? { title: "Growth", body: "" };
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Growth", {
      body: data.body ?? "",
      icon: "/icon.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/growth";
  event.waitUntil(clients.openWindow(url));
});

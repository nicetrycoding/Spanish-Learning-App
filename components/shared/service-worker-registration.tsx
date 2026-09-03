"use client";

import { useEffect } from "react";

/** Registers the offline-cache service worker (see public/sw.js) in production only. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a progressive enhancement — failing silently is fine.
    });
  }, []);

  return null;
}

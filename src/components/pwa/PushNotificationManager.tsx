"use client";

import { useEffect, useState } from "react";

type PushState = "loading" | "unsupported" | "blocked" | "subscribed" | "unsubscribed";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function PushNotificationManager() {
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSubscription() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (active) setState("unsupported");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!active) return;

        if (Notification.permission === "denied") {
          setState("blocked");
        } else {
          setState(subscription ? "subscribed" : "unsubscribed");
        }
      } catch (error) {
        console.error("Unable to inspect push subscription:", error);
        if (active) setState("unsubscribed");
      }
    }

    void checkSubscription();
    return () => {
      active = false;
    };
  }, []);

  async function enableNotifications() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      alert("إعدادات إشعارات الطلبات غير مكتملة.");
      return;
    }

    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "unsubscribed");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const response = await fetch("/api/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "تعذر حفظ إعدادات الإشعارات.");
      }

      setState("subscribed");
    } catch (error) {
      console.error("Push subscription failed:", error);
      alert(error instanceof Error ? error.message : "تعذر تفعيل الإشعارات.");
    } finally {
      setBusy(false);
    }
  }

  async function disableNotifications() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push-subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setState("unsubscribed");
    } catch (error) {
      console.error("Push unsubscribe failed:", error);
      alert("تعذر إيقاف الإشعارات. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "unsupported") {
    return (
      <span className="rounded-2xl bg-neutral-100 px-4 py-3 text-xs font-bold text-neutral-500">
        الإشعارات غير مدعومة
      </span>
    );
  }

  if (state === "blocked") {
    return (
      <span
        title="اسمح بالإشعارات من إعدادات المتصفح"
        className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700"
      >
        الإشعارات محظورة
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={state === "subscribed" ? disableNotifications : enableNotifications}
      disabled={busy || state === "loading"}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
    >
      {busy || state === "loading"
        ? "جارٍ الإعداد..."
        : state === "subscribed"
          ? "إيقاف إشعارات الطلبات"
          : "تفعيل إشعارات الطلبات"}
    </button>
  );
}

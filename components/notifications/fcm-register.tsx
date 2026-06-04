"use client";

/**
 * Push registration is triggered only via EnablePushButton (user gesture).
 * Safari blocks automatic Notification.requestPermission() on page load.
 */
export function FcmRegister() {
  return null;
}

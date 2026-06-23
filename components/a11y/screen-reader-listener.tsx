"use client";

import { useEffect, useRef } from "react";
import { announceUiSafely } from "@/components/a11y/a11y-announcer";
import { useScreenReader } from "@/components/a11y/screen-reader-provider";
import { FOCUS_DEBOUNCE_MS, POINTER_THROTTLE_MS } from "@/lib/a11y/constants";
import { getReadableTarget } from "@/lib/a11y/accessible-name";
import { getElementReadableText, textToSpeech } from "@/lib/text-to-speech";

function isExcludedTarget(element: Element | null) {
  if (!element) return true;
  return Boolean(
    element.closest("[data-a11y-exclude], [aria-label='Accessibility tools'], [aria-live]")
  );
}

export function ScreenReaderListener() {
  const { settings, readFocusedElement } = useScreenReader();
  const lastElementRef = useRef<Element | null>(null);
  const lastSpokenAtRef = useRef(0);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openDialogsRef = useRef<Set<Element>>(new Set());
  const openMenusRef = useRef<Set<Element>>(new Set());
  const seenAlertsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.readAloudOnFocus) {
      lastElementRef.current = null;
      return;
    }

    const speakTarget = (rawTarget: Element | null, source: "focus" | "pointer") => {
      if (!rawTarget || isExcludedTarget(rawTarget)) return;
      if (textToSpeech.isSpeakingContent()) return;

      const target = getReadableTarget(rawTarget);
      if (!target || isExcludedTarget(target)) return;
      if (target === lastElementRef.current) return;

      const text = getElementReadableText(target);
      if (!text) return;

      const now = Date.now();
      const throttleMs = source === "pointer" ? POINTER_THROTTLE_MS : FOCUS_DEBOUNCE_MS;
      if (now - lastSpokenAtRef.current < throttleMs) return;

      lastElementRef.current = target;
      lastSpokenAtRef.current = now;
      readFocusedElement(target);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      const target = event.target as Element | null;
      focusTimerRef.current = setTimeout(() => speakTarget(target, "focus"), FOCUS_DEBOUNCE_MS);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
      const target = event.target as Element | null;
      pointerTimerRef.current = setTimeout(() => speakTarget(target, "pointer"), POINTER_THROTTLE_MS);
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("pointerup", onPointerUp, true);

    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("pointerup", onPointerUp, true);
    };
  }, [settings.readAloudOnFocus, readFocusedElement]);

  useEffect(() => {
    const syncOverlayState = () => {
      const dialogs = document.querySelectorAll(
        "[role='dialog'][data-state='open'], [role='alertdialog'][data-state='open']"
      );
      const menus = document.querySelectorAll("[role='menu'][data-state='open']");

      for (const dialog of dialogs) {
        if (openDialogsRef.current.has(dialog)) continue;
        openDialogsRef.current.add(dialog);
        const title =
          dialog.querySelector("[id$='-title'], [slot='title'], h2, h3")?.textContent?.trim() ||
          "dialog";
        announceUiSafely(`Dialog opened: ${title}`, "assertive");
      }

      for (const known of [...openDialogsRef.current]) {
        if (!document.contains(known) || known.getAttribute("data-state") !== "open") {
          openDialogsRef.current.delete(known);
          announceUiSafely("Dialog closed", "polite");
        }
      }

      for (const menu of menus) {
        if (openMenusRef.current.has(menu)) continue;
        openMenusRef.current.add(menu);
        announceUiSafely("Menu opened", "polite");
      }

      for (const known of [...openMenusRef.current]) {
        if (!document.contains(known) || known.getAttribute("data-state") !== "open") {
          openMenusRef.current.delete(known);
          announceUiSafely("Menu closed", "polite");
        }
      }

      const alerts = document.querySelectorAll("[role='alert'], [data-sonner-toast]");
      for (const alert of alerts) {
        const text = alert.textContent?.trim();
        if (!text) continue;
        const key = `${text.slice(0, 120)}:${alert.childElementCount}`;
        if (seenAlertsRef.current.has(key)) continue;
        seenAlertsRef.current.add(key);
        announceUiSafely(text, "assertive");
        if (seenAlertsRef.current.size > 40) {
          seenAlertsRef.current.clear();
        }
      }
    };

    const observer = new MutationObserver(() => {
      syncOverlayState();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state", "role", "aria-hidden"],
    });

    syncOverlayState();

    return () => observer.disconnect();
  }, []);

  return null;
}

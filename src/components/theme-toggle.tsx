"use client";

import { useSyncExternalStore } from "react";

const eventName = "forma-theme-change";
function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== "forma-theme") return;
    document.documentElement.dataset.theme = event.newValue === "light" ? "light" : "dark";
    callback();
  };
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", onStorage);
  };
}
function getSnapshot() { return document.documentElement.dataset.theme === "light" ? "light" : "dark"; }
function getServerSnapshot() { return "dark"; }

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("forma-theme", next); } catch { /* Theme still works if storage is unavailable. */ }
    window.dispatchEvent(new Event(eventName));
  }
  return <button className="theme-toggle" type="button" aria-label="Dark theme" aria-pressed={theme === "dark"} onClick={toggle}>
    <span className={theme === "light" ? "selected" : ""}>Light</span>
    <span className={theme === "dark" ? "selected" : ""}>Dark</span>
  </button>;
}

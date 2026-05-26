import type { LogLevel } from "./types";

export function classifyEvent(type: string): LogLevel {
  const t = type.toLowerCase();
  if (t === "error") return "err";
  if (t === "warning" || t === "gamedetached" || t === "waitingforgame") return "warn";
  if (t === "gameattached" || t.endsWith("toggle") || t === "herosnapshot" ||
      t === "refillmovement" || t === "refillmana" || t === "setstat" ||
      t === "addxp" || t === "setmorale" || t === "setluck" || t === "hotkeys") return "ok";
  return "info";
}

export function nowTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const parseDraft = (s: string, fallback: number) => {
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
};

import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import type { AlertEntry, AlertLevel, LogEntry, LogLevel, Snapshot } from "./types";
import { ALERT_AUTO_DISMISS_MS, LOG_LIMIT } from "./constants";
import { classifyEvent, nowTime } from "./utils";

export const useSidecar = () => {
  const [snapshot, setSnapshot] = useState<Snapshot>({});
  const [xpPatchOn, setXpPatchOn] = useState(false);
  const [trackerOn, setTrackerOn] = useState(false);
  const [freezeAttackOn, setFreezeAttackOn] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connText, setConnText] = useState("Oczekiwanie na proces gry…");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alert, setAlert] = useState<AlertEntry | null>(null);
  const logIdRef = useRef(0);
  const alertIdRef = useRef(0);
  const alertTimerRef = useRef<number | null>(null);

  const pushLog = (level: LogLevel, tag: string, message: string) => {
    setLogs(prev => {
      const next = [...prev, { id: ++logIdRef.current, time: nowTime(), level, tag, message }];
      if (next.length > LOG_LIMIT) next.splice(0, next.length - LOG_LIMIT);
      return next;
    });
  };

  const pushAlert = (level: AlertLevel, tag: string, message: string) => {
    setAlert({ id: ++alertIdRef.current, level, tag, message });
    if (alertTimerRef.current != null) window.clearTimeout(alertTimerRef.current);
    alertTimerRef.current = window.setTimeout(() => setAlert(null), ALERT_AUTO_DISMISS_MS);
  };

  const dismissAlert = () => {
    if (alertTimerRef.current != null) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
    setAlert(null);
  };

  useEffect(() => {
    const unlistenP = listen<string>("trainer-message", (event) => {
      const raw = event.payload;
      try {
        const parsed = JSON.parse(raw);
        const type = String(parsed.type ?? "Message");
        const msg = String(parsed.message ?? raw);
        const data = parsed.data;
        const enabled: boolean | undefined =
          typeof parsed.enabled === "boolean" ? parsed.enabled : undefined;

        switch (type) {
          case "GameAttached":
            setConnected(true);
            setConnText(msg);
            break;
          case "GameDetached":
          case "WaitingForGame":
            setConnected(false);
            setConnText(msg);
            setXpPatchOn(false);
            setTrackerOn(false);
            setFreezeAttackOn(false);
            break;
          case "HeroSnapshot":
            if (data && typeof data === "object") setSnapshot(data as Snapshot);
            break;
          case "RefillMovement":
            if (data && typeof data === "object") {
              setSnapshot(prev => ({ ...prev, movement: data.value, movementMax: data.max }));
            }
            break;
          case "RefillMana":
            if (data && typeof data === "object") {
              setSnapshot(prev => ({ ...prev, mana: data.value, maxMana: data.max }));
            }
            break;
          case "AddXp":
            if (data && typeof data === "object" && typeof data.after === "number") {
              setSnapshot(prev => ({ ...prev, experience: data.after }));
            }
            break;
          case "SetStat":
            if (data && typeof data === "object") {
              const stat = String(data.stat ?? "").toLowerCase();
              const v = data.value as number | undefined;
              if (v != null) {
                setSnapshot(prev => {
                  if (stat.startsWith("atak")  || stat === "attack")    return { ...prev, attack: v };
                  if (stat.startsWith("obron") || stat === "defense")   return { ...prev, defense: v };
                  if (stat.startsWith("spell") || stat.includes("moc")) return { ...prev, spellPower: v };
                  if (stat.startsWith("wiedz") || stat === "knowledge") return { ...prev, knowledge: v };
                  return prev;
                });
              }
            }
            break;
          case "XpPatchToggle":
            if (enabled !== undefined) setXpPatchOn(enabled);
            break;
          case "TrackerToggle":
            if (enabled !== undefined) setTrackerOn(enabled);
            break;
          case "ToggleFreezeAttack":
            if (enabled !== undefined) setFreezeAttackOn(enabled);
            break;
        }
        const level = classifyEvent(type);
        if (level === "err" || level === "warn") pushAlert(level, type, msg);
        pushLog(level, type, msg);
      } catch {
        pushLog("info", "raw", raw);
      }
    });
    return () => {
      unlistenP.then(u => u());
      if (alertTimerRef.current != null) window.clearTimeout(alertTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    snapshot, setSnapshot,
    xpPatchOn, trackerOn, freezeAttackOn,
    connected, connText,
    logs, setLogs, pushLog,
    alert, pushAlert, dismissAlert,
  };
};

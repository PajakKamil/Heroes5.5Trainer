import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import type { StatField, StatSpec } from "./types";
import {
  STAT_DEFAULT, STAT_MIN, STAT_MAX,
  XP_DEFAULT_DELTA, XP_MIN, XP_MAX,
  STATS,
  SPARK_COUNT, SPARK_BASE_DIST, SPARK_RAND_DIST, SPARK_LIFETIME_MS,
} from "./constants";
import { clamp, parseDraft } from "./utils";
import { useSidecar } from "./useSidecar";

import { Header } from "./components/Header";
import { TitleBar } from "./components/TitleBar";
import { TrackerSection } from "./components/TrackerSection";
import { StatCard } from "./components/StatCard";
import { ResourcesSection } from "./components/ResourcesSection";
import { TogglesSection } from "./components/TogglesSection";
import { BestowButton } from "./components/BestowButton";
import { LogWindow } from "./components/LogWindow";

type Spark = { id: number; dx: number; dy: number; delay: number };

function App() {
  const {
    snapshot,
    xpPatchOn, trackerOn, freezeAttackOn,
    connected, connText,
    logs, setLogs, pushLog,
    alert, pushAlert, dismissAlert,
  } = useSidecar();

  const [drafts, setDrafts] = useState<Record<StatField, string>>({
    attack: String(STAT_DEFAULT),
    defense: String(STAT_DEFAULT),
    spellPower: String(STAT_DEFAULT),
    knowledge: String(STAT_DEFAULT),
    morale: String(STAT_DEFAULT),
    luck: String(STAT_DEFAULT),
    freezeAttack: String(STAT_DEFAULT),
  });
  const [xpDelta, setXpDelta] = useState<string>(String(XP_DEFAULT_DELTA));
  const [cmdInput, setCmdInput] = useState("");
  const [bestowing, setBestowing] = useState(false);
  const [bumped, setBumped] = useState<string | null>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);

  const sparkIdRef = useRef(0);
  const focusedFieldRef = useRef<StatField | null>(null);

  // sync drafts from snapshot for stats not currently being edited
  useEffect(() => {
    setDrafts(prev => {
      const next = { ...prev };
      const sync = (field: StatField, val?: number) => {
        if (val == null) return;
        if (focusedFieldRef.current !== field) next[field] = String(val);
      };
      sync("attack",     snapshot.attack);
      sync("defense",    snapshot.defense);
      sync("spellPower", snapshot.spellPower);
      sync("knowledge",  snapshot.knowledge);
      return next;
    });
  }, [snapshot.attack, snapshot.defense, snapshot.spellPower, snapshot.knowledge]);

  // ============ COMMAND DISPATCH ============
  const sendCommand = async (command: string, value?: number | null) => {
    const payload = value === undefined ? command : JSON.stringify({ command, value: value ?? null });
    pushLog("info", "send", payload);
    try {
      const reply: string = await invoke("call_sidecar", { command: payload });
      if (reply) pushLog("info", "reply", reply);
    } catch (err) {
      const msg = String(err);
      pushLog("err", "error", msg);
      pushAlert("err", "error", msg);
    }
  };

  const bump = (id: string) => {
    setBumped(null);
    requestAnimationFrame(() => setBumped(id));
  };

  const applyStat = (s: StatSpec) => {
    const val = clamp(parseDraft(drafts[s.field], STAT_DEFAULT), STAT_MIN, STAT_MAX);
    setDrafts(prev => ({ ...prev, [s.field]: String(val) }));
    bump(`apply-${s.field}`);
    sendCommand(s.command, val);
  };

  const handleAddXp = () => {
    const val = clamp(parseDraft(xpDelta, XP_DEFAULT_DELTA), XP_MIN, XP_MAX);
    setXpDelta(String(val));
    bump("addxp");
    sendCommand("AddXp", val);
  };

  const handleRefillMovement = () => { bump("refill-mov");  sendCommand("RefillMovement"); };
  const handleRefillMana     = () => { bump("refill-mana"); sendCommand("RefillMana"); };
  const handleShowSnapshot   = () => { sendCommand("ShowSnapshot"); };
  const handleDumpHero       = () => { bump("dump"); sendCommand("DumpHero"); };
  const handleToggleXpPatch  = () => sendCommand("XpPatchToggle");
  const handleToggleTracker  = () => sendCommand("TrackerToggle");
  const handleToggleFreezeAttack = () => {
    if (freezeAttackOn) {
      sendCommand("ToggleFreezeAttack");
    } else {
      const val = clamp(parseDraft(drafts.freezeAttack, STAT_DEFAULT), STAT_MIN, STAT_MAX);
      setDrafts(prev => ({ ...prev, freezeAttack: String(val) }));
      sendCommand("ToggleFreezeAttack", val);
    }
  };

  const handleBestow = () => {
    setBestowing(false);
    requestAnimationFrame(() => setBestowing(true));
    const newSparks: Spark[] = Array.from({ length: SPARK_COUNT }, () => {
      const ang = Math.PI * 2 * Math.random() + (Math.random() - 0.5) * 0.4;
      const dist = SPARK_BASE_DIST + Math.random() * SPARK_RAND_DIST;
      return { id: ++sparkIdRef.current, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, delay: Math.random() * 60 };
    });
    setSparks(prev => [...prev, ...newSparks]);
    setTimeout(() => setSparks(prev => prev.filter(s => !newSparks.find(ns => ns.id === s.id))), SPARK_LIFETIME_MS);
    handleShowSnapshot();
  };

  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cmdInput.trim()) { sendCommand(cmdInput.trim()); setCmdInput(""); }
  };

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="torn-edge" x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022 0.06" numOctaves={3} seed={7} result="turb" />
            <feDisplacementMap in="SourceGraphic" in2="turb" scale={18} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <main className="sheet">
        <TitleBar />
        <span className="crease" aria-hidden="true" />
        <span className="crease v" aria-hidden="true" />
        <span className="hole h1" aria-hidden="true" />
        <span className="hole h2" aria-hidden="true" />
        <span className="hole h3" aria-hidden="true" />

        <Header connected={connected} connText={connText} snapshot={snapshot} />

        <p className="preamble">
          <span className="drop">N</span>iech opiekun tego kodeksu wpisze bohaterowi nowe cnoty,
          aby jego męstwo i kunszt urosły dziesięciokroć przed świtem.
        </p>

        <TrackerSection trackerOn={trackerOn} onToggle={handleToggleTracker} />

        <h2 className="section-title">Virtutes · Statystyki</h2>
        <section className="grid">
          {STATS.map(s => (
            <StatCard
              key={s.field}
              spec={s}
              draft={drafts[s.field]}
              snapshot={snapshot}
              focusedFieldRef={focusedFieldRef}
              setDrafts={setDrafts}
              onApply={applyStat}
              bumped={bumped}
            />
          ))}
        </section>

        <ResourcesSection
          snapshot={snapshot}
          xpDelta={xpDelta}
          setXpDelta={setXpDelta}
          onAddXp={handleAddXp}
          onRefillMana={handleRefillMana}
          onRefillMovement={handleRefillMovement}
          bumped={bumped}
        />

        <TogglesSection
          xpPatchOn={xpPatchOn}
          freezeAttackOn={freezeAttackOn}
          freezeDraft={drafts.freezeAttack}
          focusedFieldRef={focusedFieldRef}
          setDrafts={setDrafts}
          snapshot={snapshot}
          onToggleXpPatch={handleToggleXpPatch}
          onToggleFreezeAttack={handleToggleFreezeAttack}
          onShowSnapshot={handleShowSnapshot}
          onDumpHero={handleDumpHero}
        />

        <BestowButton
          bestowing={bestowing}
          sparks={sparks}
          onClick={handleBestow}
          onAnimationEnd={() => setBestowing(false)}
        />

        <div className="footer-marks">
          <span>fol. I</span>
          <span className="ornament" />
          <span>signum scriptoris &nbsp;✶</span>
          <span className="ornament" />
          <span>anno regni</span>
        </div>
      </main>

      {alert && (
        <div
          key={alert.id}
          className={`article-alert ${alert.level}`}
          role="alert"
          aria-live="assertive"
        >
          <span className="article-alert-sigil" aria-hidden="true">
            {alert.level === "err" ? "✶" : "⚜"}
          </span>
          <div className="article-alert-body">
            <span className="article-alert-tag">
              {alert.level === "err" ? "Błąd" : "Ostrzeżenie"} · {alert.tag}
            </span>
            <span className="article-alert-msg">{alert.message}</span>
          </div>
          <button
            type="button"
            className="article-alert-close"
            onClick={dismissAlert}
            aria-label="Zamknij komunikat"
          >
            ×
          </button>
        </div>
      )}

      <LogWindow
        logs={logs}
        cmdInput={cmdInput}
        setCmdInput={setCmdInput}
        onSubmit={handleCmdSubmit}
        onClear={() => setLogs([])}
      />
    </>
  );
}

export default App;

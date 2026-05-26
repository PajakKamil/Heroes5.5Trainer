import { useEffect, useRef, useState, type ReactElement } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

// ============ CONSTANTS ============
const STAT_MIN = 0;
const STAT_MAX = 999;
const STAT_DEFAULT = 99;

const XP_MIN = -2_000_000_000;
const XP_MAX = 2_000_000_000;
const XP_DEFAULT_DELTA = 1_000_000;

const SPARK_COUNT = 9;
const SPARK_BASE_DIST = 45;
const SPARK_RAND_DIST = 35;
const SPARK_LIFETIME_MS = 900;
const LOG_LIMIT = 500;

// ============ TYPES ============
type IconKey =
  | "crown" | "scroll" | "sword" | "shield" | "book" | "wand"
  | "flask" | "chalice" | "boot" | "snow" | "eye" | "dump"
  | "smile" | "cloverleaf";

type Snapshot = {
  heroPtr?: number;
  attack?: number;
  defense?: number;
  spellPower?: number;
  knowledge?: number;
  experience?: number;
  currentLevel?: number;
  toLevel?: number;
  mana?: number;
  maxMana?: number;
  movement?: number;
  movementMax?: number;
};

type StatField =
  | "attack" | "defense" | "spellPower" | "knowledge"
  | "morale" | "luck" | "freezeAttack";

type StatSpec = {
  field: StatField;
  command: string;
  name: string;
  icon: IconKey;
  hotkey: string[];
  hasSnapshot: boolean;
};

const STATS: StatSpec[] = [
  { field: "attack",       command: "SetAttack",     name: "Attack",      icon: "sword",   hotkey: ["Ctrl","5"], hasSnapshot: true  },
  { field: "defense",      command: "SetDefense",    name: "Defense",     icon: "shield",  hotkey: ["Ctrl","6"], hasSnapshot: true  },
  { field: "spellPower",   command: "SetSpellPower", name: "Spell Power", icon: "wand",    hotkey: ["Ctrl","7"], hasSnapshot: true  },
  { field: "knowledge",    command: "SetKnowledge",  name: "Knowledge",   icon: "book",    hotkey: ["Ctrl","8"], hasSnapshot: true  },
  { field: "morale",       command: "SetMorale",     name: "Morale",      icon: "smile",   hotkey: ["Ctrl","Alt","1"], hasSnapshot: false },
  { field: "luck",         command: "SetLuck",       name: "Luck",        icon: "cloverleaf", hotkey: ["Ctrl","Alt","2"], hasSnapshot: false },
];

// ============ ICONS ============
const ICONS: Record<IconKey, ReactElement> = {
  crown: (<svg viewBox="0 0 24 24"><path d="M3 18 H21 M4 8 L8 13 L12 6 L16 13 L20 8 L19 17 H5 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><circle cx="4" cy="8" r="1.2" fill="currentColor"/><circle cx="20" cy="8" r="1.2" fill="currentColor"/><circle cx="12" cy="6" r="1.2" fill="currentColor"/></svg>),
  scroll: (<svg viewBox="0 0 24 24"><path d="M5 6 Q5 4 7 4 H19 Q17 4 17 6 V17 Q17 19 19 19 H7 Q5 19 5 17 Z" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9 H14 M9 12 H14 M9 15 H12" stroke="currentColor" strokeWidth="1"/></svg>),
  sword: (<svg viewBox="0 0 24 24"><path d="M19 4 L13 10 L11 8 L17 2 Z M13 10 L5 18 L4 20 L6 19 L14 11 Z M6 17 L9 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>),
  shield: (<svg viewBox="0 0 24 24"><path d="M12 3 L20 6 V12 Q20 18 12 21 Q4 18 4 12 V6 Z" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M12 7 V17 M7 12 H17" stroke="currentColor" strokeWidth="1"/></svg>),
  book: (<svg viewBox="0 0 24 24"><path d="M4 5 Q4 4 5 4 H11 Q12 4 12 5 V19 Q12 18 11 18 H5 Q4 18 4 19 Z M20 5 Q20 4 19 4 H13 Q12 4 12 5 V19 Q12 18 13 18 H19 Q20 18 20 19 Z" fill="none" stroke="currentColor" strokeWidth="1.3"/></svg>),
  wand: (<svg viewBox="0 0 24 24"><path d="M5 19 L17 7" stroke="currentColor" strokeWidth="1.4"/><path d="M16 4 L18 6 L20 4 L18 2 Z M17 7 L19 9" fill="currentColor" stroke="currentColor" strokeWidth="1"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="14" cy="20" r="1" fill="currentColor"/></svg>),
  flask: (<svg viewBox="0 0 24 24"><path d="M9 3 H15 M10 3 V9 L5 19 Q4 21 6 21 H18 Q20 21 19 19 L14 9 V3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 15 H17" stroke="currentColor" strokeWidth="1"/></svg>),
  chalice: (<svg viewBox="0 0 24 24"><path d="M6 4 H18 Q18 12 12 14 Q6 12 6 4 Z M12 14 V19 M8 21 H16" fill="none" stroke="currentColor" strokeWidth="1.3"/></svg>),
  boot: (<svg viewBox="0 0 24 24"><path d="M4 16 Q4 10 12 10 Q20 10 20 16 M7 10 L4 7 M4 7 L7 4 M17 10 L20 7 M20 7 L17 4 M9 20 H15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  snow: (<svg viewBox="0 0 24 24"><path d="M12 2 V22 M2 12 H22 M5 5 L19 19 M19 5 L5 19 M12 6 L10 4 M12 6 L14 4 M12 18 L10 20 M12 18 L14 20 M6 12 L4 10 M6 12 L4 14 M18 12 L20 10 M18 12 L20 14" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>),
  eye: (<svg viewBox="0 0 24 24"><path d="M2 12 Q7 5 12 5 Q17 5 22 12 Q17 19 12 19 Q7 19 2 12 Z" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>),
  dump: (<svg viewBox="0 0 24 24"><path d="M6 3 H14 L18 7 V21 H6 Z M14 3 V7 H18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 12 H15 M9 15 H15 M9 18 H13" stroke="currentColor" strokeWidth="1"/></svg>),
  smile: (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M8 14 Q12 18 16 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>),
  cloverleaf: (<svg viewBox="0 0 24 24"><path d="M12 12 C12 6 6 6 6 10 C6 14 12 14 12 12 M12 12 C12 6 18 6 18 10 C18 14 12 14 12 12 M12 12 C6 12 6 18 10 18 C14 18 14 12 12 12 M12 12 C18 12 18 18 14 18 C10 18 10 12 12 12 M12 14 V21" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>),
};

const CornerSym = () => (
  <svg viewBox="0 0 14 14">
    <path d="M1 13 V5 Q1 1 5 1 H13" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="5" cy="5" r="1.4" fill="currentColor" />
  </svg>
);

const FiligreeSym = () => (
  <svg className="filigree" viewBox="0 0 20 20">
    <path d="M2 10 Q10 2 18 10 Q10 18 2 10 Z M10 6 V14 M6 10 H14" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const Corners = () => (
  <>
    <span className="corner tl"><CornerSym /></span>
    <span className="corner tr"><CornerSym /></span>
    <span className="corner bl"><CornerSym /></span>
    <span className="corner br"><CornerSym /></span>
  </>
);

const Ribbon = ({
  on, onClick, onKeyDown,
}: {
  on: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => {
  const inner = (
    <>
      <div className="side l">OFF</div>
      <div className="side r">ON</div>
      <div className="knob" />
    </>
  );
  return on ? (
    <div
      className="ribbon on"
      role="switch"
      aria-checked="true"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {inner}
    </div>
  ) : (
    <div
      className="ribbon"
      role="switch"
      aria-checked="false"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {inner}
    </div>
  );
};

const Hotkey = ({ keys }: { keys: string[] }) => (
  <span className="hotkey" aria-label={`Skrót: ${keys.join("+")}`}>
    {keys.map((k, i) => (
      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {i > 0 && <span className="plus-sep">+</span>}
        <kbd>{k}</kbd>
      </span>
    ))}
  </span>
);

// ============ LOG TYPES ============
type LogLevel = "info" | "ok" | "warn" | "err";
type LogEntry = { id: number; time: string; level: LogLevel; tag: string; message: string };

function classifyEvent(type: string): LogLevel {
  const t = type.toLowerCase();
  if (t === "error") return "err";
  if (t === "warning" || t === "gamedetached" || t === "waitingforgame") return "warn";
  if (t === "gameattached" || t.endsWith("toggle") || t === "herosnapshot" ||
      t === "refillmovement" || t === "refillmana" || t === "setstat" ||
      t === "addxp" || t === "setmorale" || t === "setluck" || t === "hotkeys") return "ok";
  return "info";
}

function nowTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function App() {
  const [snapshot, setSnapshot] = useState<Snapshot>({});
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

  const [xpPatchOn, setXpPatchOn] = useState(false);
  const [trackerOn, setTrackerOn] = useState(false);
  const [freezeAttackOn, setFreezeAttackOn] = useState(false);

  const [connected, setConnected] = useState(false);
  const [connText, setConnText] = useState("Oczekiwanie na proces gry…");

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cmdInput, setCmdInput] = useState("");
  const [bestowing, setBestowing] = useState(false);
  const [bumped, setBumped] = useState<string | null>(null);
  const [sparks, setSparks] = useState<{ id: number; dx: number; dy: number; delay: number }[]>([]);

  const logIdRef = useRef(0);
  const sparkIdRef = useRef(0);
  const logBodyRef = useRef<HTMLDivElement>(null);
  const focusedFieldRef = useRef<StatField | null>(null);

  const pushLog = (level: LogLevel, tag: string, message: string) => {
    setLogs(prev => {
      const next = [...prev, { id: ++logIdRef.current, time: nowTime(), level, tag, message }];
      if (next.length > LOG_LIMIT) next.splice(0, next.length - LOG_LIMIT);
      return next;
    });
  };

  // When snapshot fields change, sync drafts for stats that aren't being edited
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

  // Listen for sidecar events
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
            // game gone → toggles unknown, treat as off
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
                  if (stat.startsWith("atak")    || stat === "attack")      return { ...prev, attack: v };
                  if (stat.startsWith("obron")   || stat === "defense")     return { ...prev, defense: v };
                  if (stat.startsWith("spell")   || stat.includes("moc"))   return { ...prev, spellPower: v };
                  if (stat.startsWith("wiedz")   || stat === "knowledge")   return { ...prev, knowledge: v };
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
        pushLog(classifyEvent(type), type, msg);
      } catch {
        pushLog("info", "raw", raw);
      }
    });
    return () => { unlistenP.then(u => u()); };
  }, []);

  useEffect(() => {
    const el = logBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  // ============ COMMAND DISPATCH ============
  const sendCommand = async (command: string, value?: number | null) => {
    const payload = value === undefined ? command : JSON.stringify({ command, value: value ?? null });
    pushLog("info", "send", payload);
    try {
      const reply: string = await invoke("call_sidecar", { command: payload });
      if (reply) pushLog("info", "reply", reply);
    } catch (err) {
      pushLog("err", "error", String(err));
    }
  };

  const clampStat = (n: number) => Math.max(STAT_MIN, Math.min(STAT_MAX, n));
  const parseDraft = (s: string, fallback: number) => {
    const n = parseInt(s, 10);
    return isNaN(n) ? fallback : n;
  };

  const applyStat = (s: StatSpec) => {
    const val = clampStat(parseDraft(drafts[s.field], STAT_DEFAULT));
    setDrafts(prev => ({ ...prev, [s.field]: String(val) }));
    bump(`apply-${s.field}`);
    sendCommand(s.command, val);
  };

  const bump = (id: string) => {
    setBumped(null);
    requestAnimationFrame(() => setBumped(id));
  };

  const handleRefillMovement = () => { bump("refill-mov"); sendCommand("RefillMovement"); };
  const handleRefillMana     = () => { bump("refill-mana"); sendCommand("RefillMana"); };
  const handleShowSnapshot   = () => { sendCommand("ShowSnapshot"); };
  const handleDumpHero       = () => { bump("dump"); sendCommand("DumpHero"); };

  const handleAddXp = () => {
    const n = parseDraft(xpDelta, XP_DEFAULT_DELTA);
    const clamped = Math.max(XP_MIN, Math.min(XP_MAX, n));
    setXpDelta(String(clamped));
    bump("addxp");
    sendCommand("AddXp", clamped);
  };

  const handleToggleXpPatch = () => sendCommand("XpPatchToggle");
  const handleToggleTracker = () => sendCommand("TrackerToggle");
  const handleToggleFreezeAttack = () => {
    if (freezeAttackOn) {
      sendCommand("ToggleFreezeAttack");
    } else {
      const val = clampStat(parseDraft(drafts.freezeAttack, STAT_DEFAULT));
      setDrafts(prev => ({ ...prev, freezeAttack: String(val) }));
      sendCommand("ToggleFreezeAttack", val);
    }
  };

  // ============ BESTOW (wired to ShowSnapshot) ============
  const handleBestow = () => {
    setBestowing(false);
    requestAnimationFrame(() => setBestowing(true));
    const newSparks = Array.from({ length: SPARK_COUNT }, () => {
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

  // ============ RENDER HELPERS ============
  const renderStatCard = (s: StatSpec) => {
    const current = s.hasSnapshot ? (snapshot as any)[s.field] as number | undefined : undefined;
    return (
      <article className="stat" key={s.field}>
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS[s.icon]}</div>
          <div className="stat-name">{s.name}</div>
          <Hotkey keys={s.hotkey} />
        </div>
        <div className="stat-row">
          <div className="stat-value">
            <input
              className="stat-input"
              type="number"
              min={STAT_MIN}
              max={STAT_MAX}
              inputMode="numeric"
              value={drafts[s.field]}
              aria-label={`${s.name} value`}
              onFocus={() => { focusedFieldRef.current = s.field; }}
              onBlur={() => { focusedFieldRef.current = null; }}
              onChange={e => { const v = e.currentTarget.value; setDrafts(prev => ({ ...prev, [s.field]: v })); }}
              onKeyDown={e => { if (e.key === "Enter") { e.currentTarget.blur(); applyStat(s); } }}
              onWheel={e => e.currentTarget.blur()}
            />
            {current !== undefined && (
              <span className="stat-suffix">Currens: {current}</span>
            )}
          </div>
          <div className="wax-controls">
            <button
              className={`seal plus${bumped === `apply-${s.field}` ? " bumped" : ""}`}
              aria-label={`Apply ${s.name}`}
              title={`Set ${s.name} = wpisana wartość (zakres ${STAT_MIN}..${STAT_MAX}, domyślnie ${STAT_DEFAULT})`}
              onClick={() => applyStat(s)}
            >
              <span>✓</span>
            </button>
          </div>
        </div>
      </article>
    );
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
        <span className="crease" aria-hidden="true" />
        <span className="crease v" aria-hidden="true" />
        <span className="hole h1" aria-hidden="true" />
        <span className="hole h2" aria-hidden="true" />
        <span className="hole h3" aria-hidden="true" />

        <header className="ledger-head">
          <div className="title-block">
            <div className="crest" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M32 4 L58 12 L58 30 Q58 50 32 60 Q6 50 6 30 L6 12 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M32 8 L54 14.5 L54 30 Q54 47 32 56 Q10 47 10 30 L10 14.5 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                <path d="M20 22 L44 46 M44 22 L20 46" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <path d="M32 28 L38 34 L32 40 L26 34 Z" fill="currentColor" />
                <circle cx="32" cy="34" r="1.5" fill="#f3e3bf" />
              </svg>
            </div>
            <div>
              <h1 className="title">Codex&nbsp;Heroum&nbsp;V</h1>
              <div className="subtitle">— a scribe's ledger of bestowals &amp; emendations —</div>
            </div>
          </div>

          <div className={`conn${connected ? " connected" : ""}`} title="Status połączenia z procesem gry">
            <span className="dot" />
            <span>{connText}</span>
            {snapshot.currentLevel != null && (
              <span style={{ marginLeft: 10, fontStyle: "normal" }}>
                · lvl <strong>{snapshot.currentLevel}</strong>
                {snapshot.toLevel != null && <span style={{ opacity: .7 }}>/{snapshot.toLevel}</span>}
              </span>
            )}
          </div>
        </header>

        <p className="preamble">
          <span className="drop">L</span>et the keeper of this codex inscribe new virtues upon the hero,
          that his courage and craft may grow tenfold ere the next sunrise.
        </p>

        {/* ============ TRACKER (priorytetowy - potrzebny do większości poleceń) ============ */}
        <h2 className="section-title">Speculum · Tracker</h2>
        <section>
          <article className="stat tracker-top">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.eye}</div>
              <div className="stat-name">Tracker</div>
              <Hotkey keys={["Ctrl","3"]} />
            </div>
            <div className="ribbon-toggle">
              <div className={`ribbon-state${trackerOn ? "" : " off"}`}>
                <span>{trackerOn ? "Granted" : "Forbidden"}</span>
              </div>
              <Ribbon
                on={trackerOn}
                onClick={handleToggleTracker}
                onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleToggleTracker(); } }}
              />
            </div>
            <div className="toggle-desc">
              Śledzi aktualnie wskazanego bohatera w grze. Wymagany do większości poleceń (Set*, AddXp, RefillMana, RefillMovement, ShowSnapshot, DumpHero) - bez aktywnego trackera trener nie wie, na którym bohaterze operować.
            </div>
          </article>
        </section>

        {/* ============ STATS ============ */}
        <h2 className="section-title">Virtutes · Statystyki</h2>
        <section className="grid">
          {STATS.map(renderStatCard)}
        </section>

        {/* ============ RESOURCES ============ */}
        <h2 className="section-title">Vires · Zasoby</h2>
        <section className="grid">
          {/* Experience + AddXp */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.scroll}</div>
              <div className="stat-name">Experience</div>
              <Hotkey keys={["Ctrl","-"]} />
            </div>
            <div className="stat-row">
              <div className="stat-value">
                <input
                  className="stat-input"
                  type="number"
                  min={XP_MIN}
                  max={XP_MAX}
                  inputMode="numeric"
                  value={xpDelta}
                  aria-label="XP delta"
                  onChange={e => setXpDelta(e.currentTarget.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.currentTarget.blur(); handleAddXp(); } }}
                  onWheel={e => e.currentTarget.blur()}
                />
                <span className="stat-suffix">
                  {snapshot.experience != null ? `cur ${snapshot.experience}` : "Δ xp"}
                </span>
              </div>
              <div className="wax-controls">
                <button
                  className={`seal plus${bumped === "addxp" ? " bumped" : ""}`}
                  aria-label="Add XP"
                  title={`AddXp Δ (zakres ${XP_MIN}..${XP_MAX}, domyślnie ${XP_DEFAULT_DELTA})`}
                  onClick={handleAddXp}
                >
                  <span>+</span>
                </button>
              </div>
            </div>
          </article>

          {/* Mana refill */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.flask}</div>
              <div className="stat-name">Mana</div>
              <Hotkey keys={["Ctrl","9"]} />
            </div>
            <div className="stat-row">
              <div className="stat-readonly">
                {snapshot.mana ?? "—"}
                <span className="sep">/</span>
                <span className="max">{snapshot.maxMana ?? "—"}</span>
              </div>
              <div className="wax-controls">
                <button
                  className={`seal plus${bumped === "refill-mana" ? " bumped" : ""}`}
                  aria-label="Refill mana"
                  title="RefillMana"
                  onClick={handleRefillMana}
                >
                  <span>↻</span>
                </button>
              </div>
            </div>
          </article>

          {/* Movement refill */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.boot}</div>
              <div className="stat-name">Movement</div>
              <Hotkey keys={["Ctrl","1"]} />
            </div>
            <div className="stat-row">
              <div className="stat-readonly">
                {snapshot.movement ?? "—"}
                <span className="sep">/</span>
                <span className="max">{snapshot.movementMax ?? "—"}</span>
              </div>
              <div className="wax-controls">
                <button
                  className={`seal plus${bumped === "refill-mov" ? " bumped" : ""}`}
                  aria-label="Refill movement"
                  title="RefillMovement"
                  onClick={handleRefillMovement}
                >
                  <span>↻</span>
                </button>
              </div>
            </div>
          </article>
        </section>

        {/* ============ TOGGLES / ACTIONS ============ */}
        <h2 className="section-title">Sigilla · Tryby i Akcje</h2>
        <section className="grid">
          {/* XpPatch toggle */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.scroll}</div>
              <div className="stat-name">XP Patch</div>
              <Hotkey keys={["Ctrl","2"]} />
            </div>
            <div className="ribbon-toggle">
              <div className={`ribbon-state${xpPatchOn ? "" : " off"}`}>
                <span>{xpPatchOn ? "Granted" : "Forbidden"}</span>
              </div>
              <Ribbon
                on={xpPatchOn}
                onClick={handleToggleXpPatch}
                onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleToggleXpPatch(); } }}
              />
            </div>
            <div className="toggle-desc">
              Patchuje w pamięci gry funkcję obsługującą zdobywanie XP - umożliwia użycie polecenia AddXp z dowolną wartością (również ujemną) oraz omija limity nakładane przez silnik. Bez aktywnego patcha komenda AddXp może nie działać poprawnie.
            </div>
          </article>

          {/* Freeze Attack toggle (with value) */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.snow}</div>
              <div className="stat-name">Freeze Attack</div>
              <Hotkey keys={["Ctrl","0"]} />
            </div>
            <div className="stat-row">
              <input
                className="stat-input freeze-value"
                type="number"
                min={STAT_MIN}
                max={STAT_MAX}
                inputMode="numeric"
                value={drafts.freezeAttack}
                aria-label="Freeze attack value"
                onFocus={() => { focusedFieldRef.current = "freezeAttack"; }}
                onBlur={() => { focusedFieldRef.current = null; }}
                onChange={e => { const v = e.currentTarget.value; setDrafts(prev => ({ ...prev, freezeAttack: v })); }}
                onWheel={e => e.currentTarget.blur()}
                disabled={freezeAttackOn}
                title={freezeAttackOn ? "Wartość używana tylko przy włączaniu" : `0..${STAT_MAX}, domyślnie ${STAT_DEFAULT}`}
              />
              <Ribbon
                on={freezeAttackOn}
                onClick={handleToggleFreezeAttack}
                onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleToggleFreezeAttack(); } }}
              />
            </div>
          </article>

          {/* ShowSnapshot action */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.crown}</div>
              <div className="stat-name">Show Snapshot</div>
              <Hotkey keys={["Ctrl","4"]} />
            </div>
            <div className="stat-row">
              <span className="state-tag">Wypisz aktualne statystyki bohatera do logów.</span>
              <button className="scribe-btn" onClick={handleShowSnapshot}>Pokaż</button>
            </div>
          </article>

          {/* DumpHero action */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.dump}</div>
              <div className="stat-name">Dump Hero</div>
              <Hotkey keys={["Ctrl","="]} />
            </div>
            <div className="stat-row">
              <span className="state-tag">Zrzut 384 B pamięci bohatera (debug).</span>
              <button className="scribe-btn" onClick={handleDumpHero}>Zrzuć</button>
            </div>
          </article>

          {/* Level info (read-only) */}
          <article className="stat">
            <Corners />
            <div className="stat-head">
              <div className="stat-icon">{ICONS.crown}</div>
              <div className="stat-name">Level</div>
            </div>
            <div className="stat-row">
              <div className="stat-readonly">
                {snapshot.currentLevel ?? "—"}
                <span className="sep">→</span>
                <span className="max">{snapshot.toLevel ?? "—"}</span>
              </div>
              <span className="stat-suffix">to next</span>
            </div>
          </article>
        </section>

        {/* ============ BESTOW (= ShowSnapshot, ceremonial) ============ */}
        <div className="grant-wrap">
          <button
            className={`grant${bestowing ? " bestowing" : ""}`}
            type="button"
            onClick={handleBestow}
            onAnimationEnd={() => setBestowing(false)}
            title="Wyślij ShowSnapshot (z fanfarami)"
          >
            <span>
              <FiligreeSym />
              Bestow the King's Bounty
              <FiligreeSym />
            </span>
          </button>
          {sparks.map(sp => (
            <span
              key={sp.id}
              className="spark fire"
              style={{
                left: "50%", top: "50%",
                ["--dx" as any]: `${sp.dx}px`,
                ["--dy" as any]: `${sp.dy}px`,
                animationDelay: `${sp.delay}ms`,
              }}
            />
          ))}
        </div>

        <div className="footer-marks">
          <span>fol. I</span>
          <span className="ornament" />
          <span>signum scriptoris &nbsp;✶</span>
          <span className="ornament" />
          <span>anno regni</span>
        </div>
      </main>

      <section className="log-window" aria-label="Sidecar logs">
        <div className="log-head">
          <span>Scriptorium · Logs</span>
          <div className="log-actions">
            <button className="log-btn" onClick={() => setLogs([])}>Clear</button>
          </div>
        </div>
        <div className="log-body" ref={logBodyRef}>
          {logs.length === 0 ? (
            <div className="log-empty">— silence in the scriptorium —</div>
          ) : (
            logs.map(l => (
              <div className="log-line" key={l.id}>
                <span className="log-time">{l.time}</span>
                <span className={`log-tag ${l.level}`}>{l.tag}</span>
                <span className="log-msg">{l.message}</span>
              </div>
            ))
          )}
        </div>
        <form className="cmd-row" onSubmit={handleCmdSubmit}>
          <input
            className="cmd-input"
            value={cmdInput}
            onChange={e => setCmdInput(e.currentTarget.value)}
            placeholder='Wpisz komendę lub JSON, np. {"command":"SetAttack","value":500}'
            spellCheck={false}
            autoComplete="off"
          />
          <button className="log-btn" type="submit">Send</button>
        </form>
      </section>
    </>
  );
}

export default App;

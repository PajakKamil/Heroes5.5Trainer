export type IconKey =
  | "crown" | "scroll" | "sword" | "shield" | "book" | "wand"
  | "flask" | "chalice" | "boot" | "snow" | "eye" | "dump"
  | "smile" | "cloverleaf"
  | "wood" | "ore" | "mercury" | "sulfur" | "crystal" | "gems" | "gold";

export type Snapshot = {
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

export type StatField =
  | "attack" | "defense" | "spellPower" | "knowledge"
  | "morale" | "luck" | "freezeAttack";

export type ResourceField =
  | "wood" | "ore" | "mercury" | "sulfur" | "crystal" | "gems" | "gold";

export type ResourceSpec = {
  field: ResourceField;
  command: string;
  name: string;
  icon: IconKey;
  hotkey: string[];
  defaultDelta: number;
};

export type StatSpec = {
  field: StatField;
  command: string;
  name: string;
  icon: IconKey;
  hotkey: string[];
  hasSnapshot: boolean;
};

export type LogLevel = "info" | "ok" | "warn" | "err";
export type LogEntry = { id: number; time: string; level: LogLevel; tag: string; message: string };

export type AlertLevel = "warn" | "err";
export type AlertEntry = { id: number; level: AlertLevel; tag: string; message: string };

import type { StatSpec } from "./types";

export const STAT_MIN = 0;
export const STAT_MAX = 999;
export const STAT_DEFAULT = 99;

export const XP_MIN = -2_000_000_000;
export const XP_MAX = 2_000_000_000;
export const XP_DEFAULT_DELTA = 1_000_000;

export const SPARK_COUNT = 9;
export const SPARK_BASE_DIST = 45;
export const SPARK_RAND_DIST = 35;
export const SPARK_LIFETIME_MS = 900;

export const LOG_LIMIT = 500;

export const STATS: StatSpec[] = [
  { field: "attack",     command: "SetAttack",     name: "Atak",        icon: "sword",      hotkey: ["Ctrl","5"],       hasSnapshot: true  },
  { field: "defense",    command: "SetDefense",    name: "Obrona",      icon: "shield",     hotkey: ["Ctrl","6"],       hasSnapshot: true  },
  { field: "spellPower", command: "SetSpellPower", name: "Moc Czarów",  icon: "wand",       hotkey: ["Ctrl","7"],       hasSnapshot: true  },
  { field: "knowledge",  command: "SetKnowledge",  name: "Wiedza",      icon: "book",       hotkey: ["Ctrl","8"],       hasSnapshot: true  },
  { field: "morale",     command: "SetMorale",     name: "Morale",      icon: "smile",      hotkey: ["Ctrl","Alt","1"], hasSnapshot: false },
  { field: "luck",       command: "SetLuck",       name: "Szczęście",   icon: "cloverleaf", hotkey: ["Ctrl","Alt","2"], hasSnapshot: false },
];

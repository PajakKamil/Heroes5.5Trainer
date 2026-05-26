import type { Dispatch, RefObject, SetStateAction } from "react";
import type { StatField, StatSpec, Snapshot } from "../types";
import { STAT_MIN, STAT_MAX, STAT_DEFAULT } from "../constants";
import { ICONS, Corners } from "../icons";
import { Hotkey } from "./Hotkey";

type Props = {
  spec: StatSpec;
  draft: string;
  snapshot: Snapshot;
  focusedFieldRef: RefObject<StatField | null>;
  setDrafts: Dispatch<SetStateAction<Record<StatField, string>>>;
  onApply: (spec: StatSpec) => void;
  bumped: string | null;
};

export const StatCard = ({ spec, draft, snapshot, focusedFieldRef, setDrafts, onApply, bumped }: Props) => {
  const current = spec.hasSnapshot ? (snapshot as any)[spec.field] as number | undefined : undefined;
  return (
    <article className="stat">
      <Corners />
      <div className="stat-head">
        <div className="stat-icon">{ICONS[spec.icon]}</div>
        <div className="stat-name">{spec.name}</div>
        <Hotkey keys={spec.hotkey} />
      </div>
      <div className="stat-row">
        <div className="stat-value">
          <input
            className="stat-input"
            type="number"
            min={STAT_MIN}
            max={STAT_MAX}
            inputMode="numeric"
            value={draft}
            aria-label={`Wartość ${spec.name}`}
            onFocus={() => { focusedFieldRef.current = spec.field; }}
            onBlur={() => { focusedFieldRef.current = null; }}
            onChange={e => { const v = e.currentTarget.value; setDrafts(prev => ({ ...prev, [spec.field]: v })); }}
            onKeyDown={e => { if (e.key === "Enter") { e.currentTarget.blur(); onApply(spec); } }}
            onWheel={e => e.currentTarget.blur()}
          />
          {current !== undefined && (
            <span className="stat-suffix">Currens: {current}</span>
          )}
        </div>
        <div className="wax-controls">
          <button
            className={`seal plus${bumped === `apply-${spec.field}` ? " bumped" : ""}`}
            aria-label={`Zastosuj ${spec.name}`}
            title={`Ustaw ${spec.name} = wpisana wartość (zakres ${STAT_MIN}..${STAT_MAX}, domyślnie ${STAT_DEFAULT})`}
            onClick={() => onApply(spec)}
          >
            <span>✓</span>
          </button>
        </div>
      </div>
    </article>
  );
};

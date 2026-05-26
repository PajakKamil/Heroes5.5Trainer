import type { Dispatch, SetStateAction } from "react";
import type { ResourceField, ResourceSpec } from "../types";
import { RESOURCES, RESOURCE_MIN, RESOURCE_MAX } from "../constants";
import { ICONS, Corners } from "../icons";
import { Hotkey } from "./Hotkey";

type Props = {
  drafts: Record<ResourceField, string>;
  setDrafts: Dispatch<SetStateAction<Record<ResourceField, string>>>;
  onApply: (spec: ResourceSpec) => void;
  bumped: string | null;
};

export const TreasurySection = ({ drafts, setDrafts, onApply, bumped }: Props) => (
  <>
    <h2 className="section-title">Thesaurus · Skarbiec</h2>
    <section className="grid">
      {RESOURCES.map(r => (
        <article className="stat" key={r.field}>
          <Corners />
          <div className="stat-head">
            <div className="stat-icon">{ICONS[r.icon]}</div>
            <div className="stat-name">{r.name}</div>
            <Hotkey keys={r.hotkey} />
          </div>
          <div className="stat-row">
            <div className="stat-value">
              <input
                className="stat-input"
                type="number"
                min={RESOURCE_MIN}
                max={RESOURCE_MAX}
                inputMode="numeric"
                value={drafts[r.field]}
                aria-label={`Przyrost ${r.name}`}
                onChange={e => { const v = e.currentTarget.value; setDrafts(prev => ({ ...prev, [r.field]: v })); }}
                onKeyDown={e => { if (e.key === "Enter") { e.currentTarget.blur(); onApply(r); } }}
                onWheel={e => e.currentTarget.blur()}
              />
              <span className="stat-suffix">Δ {r.name.toLowerCase()}</span>
            </div>
            <div className="wax-controls">
              <button
                className={`seal plus${bumped === `add-${r.field}` ? " bumped" : ""}`}
                aria-label={`Dodaj ${r.name}`}
                title={`Dodaj ${r.name} Δ (domyślnie ${r.defaultDelta}, ujemne odejmuje)`}
                onClick={() => onApply(r)}
              >
                <span>+</span>
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  </>
);

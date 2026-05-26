import type { Snapshot } from "../types";
import { XP_MIN, XP_MAX, XP_DEFAULT_DELTA } from "../constants";
import { ICONS, Corners } from "../icons";
import { Hotkey } from "./Hotkey";

type Props = {
  snapshot: Snapshot;
  xpDelta: string;
  setXpDelta: (v: string) => void;
  onAddXp: () => void;
  onRefillMana: () => void;
  onRefillMovement: () => void;
  bumped: string | null;
};

export const ResourcesSection = ({
  snapshot, xpDelta, setXpDelta, onAddXp, onRefillMana, onRefillMovement, bumped,
}: Props) => (
  <>
    <h2 className="section-title">Vires · Zasoby</h2>
    <section className="grid">
      <article className="stat">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.scroll}</div>
          <div className="stat-name">Doświadczenie</div>
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
              aria-label="Przyrost XP"
              onChange={e => setXpDelta(e.currentTarget.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.currentTarget.blur(); onAddXp(); } }}
              onWheel={e => e.currentTarget.blur()}
            />
            <span className="stat-suffix">
              {snapshot.experience != null ? `obecnie ${snapshot.experience}` : "Δ xp"}
            </span>
          </div>
          <div className="wax-controls">
            <button
              className={`seal plus${bumped === "addxp" ? " bumped" : ""}`}
              aria-label="Dodaj XP"
              title={`Dodaj XP Δ (zakres ${XP_MIN}..${XP_MAX}, domyślnie ${XP_DEFAULT_DELTA})`}
              onClick={onAddXp}
            >
              <span>+</span>
            </button>
          </div>
        </div>
      </article>

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
              aria-label="Uzupełnij manę"
              title="Uzupełnij manę"
              onClick={onRefillMana}
            >
              <span>↻</span>
            </button>
          </div>
        </div>
      </article>

      <article className="stat">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.boot}</div>
          <div className="stat-name">Ruch</div>
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
              aria-label="Uzupełnij ruch"
              title="Uzupełnij ruch"
              onClick={onRefillMovement}
            >
              <span>↻</span>
            </button>
          </div>
        </div>
      </article>
    </section>
  </>
);

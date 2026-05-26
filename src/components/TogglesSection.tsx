import type { Dispatch, RefObject, SetStateAction } from "react";
import type { StatField, Snapshot } from "../types";
import { STAT_MIN, STAT_MAX, STAT_DEFAULT } from "../constants";
import { ICONS, Corners } from "../icons";
import { Hotkey } from "./Hotkey";
import { Ribbon, onToggleKeyDown } from "./Ribbon";

type Props = {
  xpPatchOn: boolean;
  freezeAttackOn: boolean;
  freezeDraft: string;
  focusedFieldRef: RefObject<StatField | null>;
  setDrafts: Dispatch<SetStateAction<Record<StatField, string>>>;
  snapshot: Snapshot;
  onToggleXpPatch: () => void;
  onToggleFreezeAttack: () => void;
  onShowSnapshot: () => void;
  onDumpHero: () => void;
};

export const TogglesSection = ({
  xpPatchOn, freezeAttackOn, freezeDraft, focusedFieldRef, setDrafts, snapshot,
  onToggleXpPatch, onToggleFreezeAttack, onShowSnapshot, onDumpHero,
}: Props) => (
  <>
    <h2 className="section-title">Sigilla · Tryby i Akcje</h2>
    <section className="grid">
      <article className="stat">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.scroll}</div>
          <div className="stat-name">Łata XP</div>
          <Hotkey keys={["Ctrl","2"]} />
        </div>
        <div className="ribbon-toggle">
          <div className={`ribbon-state${xpPatchOn ? "" : " off"}`}>
            <span>{xpPatchOn ? "Nadano" : "Zabroniono"}</span>
          </div>
          <Ribbon on={xpPatchOn} onClick={onToggleXpPatch} onKeyDown={onToggleKeyDown(onToggleXpPatch)} />
        </div>
        <div className="toggle-desc">
          Patchuje w pamięci gry funkcję obsługującą zdobywanie XP - umożliwia użycie polecenia
          AddXp z dowolną wartością (również ujemną) oraz omija limity nakładane przez silnik.
          Bez aktywnego patcha komenda AddXp może nie działać poprawnie.
        </div>
      </article>

      <article className="stat">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.snow}</div>
          <div className="stat-name">Zamroź Atak</div>
          <Hotkey keys={["Ctrl","0"]} />
        </div>
        <div className="stat-row">
          <input
            className="stat-input freeze-value"
            type="number"
            min={STAT_MIN}
            max={STAT_MAX}
            inputMode="numeric"
            value={freezeDraft}
            aria-label="Wartość Zamroź Atak"
            onFocus={() => { focusedFieldRef.current = "freezeAttack"; }}
            onBlur={() => { focusedFieldRef.current = null; }}
            onChange={e => { const v = e.currentTarget.value; setDrafts(prev => ({ ...prev, freezeAttack: v })); }}
            onWheel={e => e.currentTarget.blur()}
            disabled={freezeAttackOn}
            title={freezeAttackOn ? "Wartość używana tylko przy włączaniu" : `0..${STAT_MAX}, domyślnie ${STAT_DEFAULT}`}
          />
          <Ribbon on={freezeAttackOn} onClick={onToggleFreezeAttack} onKeyDown={onToggleKeyDown(onToggleFreezeAttack)} />
        </div>
      </article>

      <article className="stat">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.crown}</div>
          <div className="stat-name">Pokaż Stan</div>
          <Hotkey keys={["Ctrl","4"]} />
        </div>
        <div className="stat-row">
          <span className="state-tag">Wypisz aktualne statystyki bohatera do logów.</span>
          <button className="scribe-btn" onClick={onShowSnapshot}>Pokaż</button>
        </div>
      </article>

      <article className="stat">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.dump}</div>
          <div className="stat-name">Zrzut Bohatera</div>
          <Hotkey keys={["Ctrl","="]} />
        </div>
        <div className="stat-row">
          <span className="state-tag">Zrzut 384 B pamięci bohatera (debug).</span>
          <button className="scribe-btn" onClick={onDumpHero}>Zrzuć</button>
        </div>
      </article>

      <article className="stat">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.crown}</div>
          <div className="stat-name">Poziom</div>
        </div>
        <div className="stat-row">
          <div className="stat-readonly">
            {snapshot.currentLevel ?? "—"}
            <span className="sep">→</span>
            <span className="max">{snapshot.toLevel ?? "—"}</span>
          </div>
          <span className="stat-suffix">do następnego</span>
        </div>
      </article>
    </section>
  </>
);

import { ICONS, Corners } from "../icons";
import { Hotkey } from "./Hotkey";
import { Ribbon, onToggleKeyDown } from "./Ribbon";

type Props = {
  trackerOn: boolean;
  onToggle: () => void;
};

export const TrackerSection = ({ trackerOn, onToggle }: Props) => (
  <>
    <h2 className="section-title">Speculum · Śledzenie</h2>
    <section>
      <article className="stat tracker-top">
        <Corners />
        <div className="stat-head">
          <div className="stat-icon">{ICONS.eye}</div>
          <div className="stat-name">Śledzenie</div>
          <Hotkey keys={["Ctrl","3"]} />
        </div>
        <div className="ribbon-toggle">
          <div className={`ribbon-state${trackerOn ? "" : " off"}`}>
            <span>{trackerOn ? "Nadano" : "Zabroniono"}</span>
          </div>
          <Ribbon on={trackerOn} onClick={onToggle} onKeyDown={onToggleKeyDown(onToggle)} />
        </div>
        <div className="toggle-desc">
          Śledzi aktualnie wskazanego bohatera w grze. Wymagany do większości poleceń
          (Set*, AddXp, RefillMana, RefillMovement, ShowSnapshot, DumpHero) - bez aktywnego
          trackera trener nie wie, na którym bohaterze operować.
        </div>
      </article>
    </section>
  </>
);

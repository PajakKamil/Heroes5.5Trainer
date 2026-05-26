import type { Snapshot } from "../types";

type Props = {
  connected: boolean;
  connText: string;
  snapshot: Snapshot;
};

export const Header = ({ connected, connText, snapshot }: Props) => (
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
        <div className="subtitle">— skryba spisuje nadania i poprawki —</div>
      </div>
    </div>

    <div className={`conn${connected ? " connected" : ""}`} title="Status połączenia z procesem gry">
      <span className="dot" />
      <span>{connText}</span>
      {snapshot.currentLevel != null && (
        <span style={{ marginLeft: 10, fontStyle: "normal" }}>
          · poz. <strong>{snapshot.currentLevel}</strong>
          {snapshot.toLevel != null && <span style={{ opacity: .7 }}>/{snapshot.toLevel}</span>}
        </span>
      )}
    </div>
  </header>
);

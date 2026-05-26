import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export const TitleBar = () => {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    appWindow.isMaximized().then(setMaximized);
    appWindow.onResized(async () => {
      setMaximized(await appWindow.isMaximized());
    }).then(u => { unlisten = u; });
    return () => { unlisten?.(); };
  }, []);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-left" data-tauri-drag-region>
        <span className="titlebar-sigil" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path
              d="M16 3 L28 7 L28 16 Q28 25 16 29 Q4 25 4 16 L4 7 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M11 12 L21 22 M21 12 L11 22" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M16 14 L19 17 L16 20 L13 17 Z" fill="currentColor" />
          </svg>
        </span>
        <span className="titlebar-title" data-tauri-drag-region>
          Codex&nbsp;Heroum&nbsp;V&nbsp;·&nbsp;Trainer
        </span>
      </div>

      <div className="titlebar-controls">
        <button
          type="button"
          className="titlebar-btn"
          onClick={() => appWindow.minimize()}
          aria-label="Zwiń"
          title="Zwiń"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 6 H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar-btn"
          onClick={() => appWindow.toggleMaximize()}
          aria-label={maximized ? "Przywróć" : "Rozszerz"}
          title={maximized ? "Przywróć" : "Rozszerz"}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            {maximized ? (
              <>
                <rect x="2.5" y="3.5" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 3.5 V2.5 H9.5 V8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </>
            ) : (
              <rect x="2.5" y="2.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
            )}
          </svg>
        </button>
        <button
          type="button"
          className="titlebar-btn titlebar-close"
          onClick={() => appWindow.close()}
          aria-label="Zamknij"
          title="Zamknij"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

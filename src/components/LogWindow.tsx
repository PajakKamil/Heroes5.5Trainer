import { useEffect, useRef } from "react";
import type { LogEntry } from "../types";

type Props = {
  logs: LogEntry[];
  cmdInput: string;
  setCmdInput: (v: string) => void;
  onSubmit: (e: React.SubmitEvent) => void;
  onClear: () => void;
};

export const LogWindow = ({ logs, cmdInput, setCmdInput, onSubmit, onClear }: Props) => {
  const logBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <section className="log-window" aria-label="Logi sidecara">
      <div className="log-head">
        <span>Scriptorium · Logi</span>
        <div className="log-actions">
          <button className="log-btn" onClick={onClear}>Wyczyść</button>
        </div>
      </div>
      <div className="log-body" ref={logBodyRef}>
        {logs.length === 0 ? (
          <div className="log-empty">— cisza w skryptorium —</div>
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
      <form className="cmd-row" onSubmit={onSubmit}>
        <input
          className="cmd-input"
          value={cmdInput}
          onChange={e => setCmdInput(e.currentTarget.value)}
          placeholder='Wpisz komendę lub JSON, np. {"command":"SetAttack","value":500}'
          spellCheck={false}
          autoComplete="off"
        />
        <button className="log-btn" type="submit">Wyślij</button>
      </form>
    </section>
  );
};

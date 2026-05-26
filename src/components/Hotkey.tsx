export const Hotkey = ({ keys }: { keys: string[] }) => (
  <span className="hotkey" aria-label={`Skrót: ${keys.join("+")}`}>
    {keys.map((k, i) => (
      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {i > 0 && <span className="plus-sep">+</span>}
        <kbd>{k}</kbd>
      </span>
    ))}
  </span>
);

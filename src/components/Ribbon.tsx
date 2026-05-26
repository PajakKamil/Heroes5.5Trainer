import type { KeyboardEvent } from "react";

type Props = {
  on: boolean;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
};

const Inner = () => (
  <>
    <div className="side l">OFF</div>
    <div className="side r">ON</div>
    <div className="knob" />
  </>
);

export const Ribbon = ({ on, onClick, onKeyDown }: Props) =>
  on ? (
    <div
      className="ribbon on"
      role="switch"
      aria-checked="true"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <Inner />
    </div>
  ) : (
    <div
      className="ribbon"
      role="switch"
      aria-checked="false"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <Inner />
    </div>
  );

export const onToggleKeyDown =
  (handler: () => void) => (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  };

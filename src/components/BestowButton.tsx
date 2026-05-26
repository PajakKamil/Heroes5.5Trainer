import { FiligreeSym } from "../icons";

type Spark = { id: number; dx: number; dy: number; delay: number };

type Props = {
  bestowing: boolean;
  sparks: Spark[];
  onClick: () => void;
  onAnimationEnd: () => void;
};

export const BestowButton = ({ bestowing, sparks, onClick, onAnimationEnd }: Props) => (
  <div className="grant-wrap">
    <button
      className={`grant${bestowing ? " bestowing" : ""}`}
      type="button"
      onClick={onClick}
      onAnimationEnd={onAnimationEnd}
      title="Nadaj królewski zapas ruchu (SetMovement = 999 999)"
    >
      <span>
        <FiligreeSym />
        Nadaj Dar Króla
        <FiligreeSym />
      </span>
    </button>
    {sparks.map(sp => (
      <span
        key={sp.id}
        className="spark fire"
        style={{
          left: "50%", top: "50%",
          ["--dx" as any]: `${sp.dx}px`,
          ["--dy" as any]: `${sp.dy}px`,
          animationDelay: `${sp.delay}ms`,
        }}
      />
    ))}
  </div>
);

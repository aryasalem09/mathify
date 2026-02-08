import "../lab.css";

type DifficultyBadgeProps = {
  difficulty: string;
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const normalized = difficulty.toLowerCase();
  return (
    <span className={`lab-badge lab-badge--${normalized}`}>{difficulty}</span>
  );
}

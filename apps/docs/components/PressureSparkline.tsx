export function PressureSparkline({ pressures }: { pressures: number[] }) {
  if (pressures.length < 2) return null;

  const width = 240;
  const height = 40;
  const step = width / (pressures.length - 1);
  const points = pressures
    .map((p, i) => `${(i * step).toFixed(1)},${(height - p * height).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

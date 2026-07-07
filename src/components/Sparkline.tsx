export default function Sparkline({ data, up }: { data?: number[]; up: boolean | null }) {
  if (!data || data.length < 2) return <span className="text-dim">—</span>;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(" ");
  const color = up == null ? "#8b98a9" : up ? "#26a69a" : "#ef5350";
  return (
    <svg viewBox="0 0 100 30" className="h-[30px] w-[100px]" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}


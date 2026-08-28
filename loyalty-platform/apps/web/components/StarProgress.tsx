// Renders filled/unfilled stars for a customer's progress toward a reward.
// The "star" symbol is a default — PRD allows any configurable symbol per
// merchant, so `symbol` is a prop rather than hardcoded.
export function StarProgress({
  current,
  target,
  symbol = "\u2605", // ★
}: {
  current: number;
  target: number;
  symbol?: string;
}) {
  const stars = Array.from({ length: target }, (_, i) => i < current);

  return (
    <div className="flex flex-wrap gap-1" aria-label={`${current} of ${target} stars`}>
      {stars.map((filled, i) => (
        <span
          key={i}
          className={filled ? "text-amber-500 text-2xl" : "text-gray-300 text-2xl"}
        >
          {symbol}
        </span>
      ))}
    </div>
  );
}

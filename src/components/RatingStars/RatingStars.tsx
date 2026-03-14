// src/components/RatingStars/RatingStars.tsx
interface RatingStarsProps {
  avgRating?: number;
  ratingCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
}

export function RatingStars({
  avgRating,
  ratingCount,
  showCount = true,
  size = 'md',
}: RatingStarsProps) {
  const safeAvg   = avgRating ?? 0;
  const safeCount = ratingCount ?? 0;

  const starSizeClass = size === 'sm' ? 'text-sm' : 'text-base';
  const textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm';

  if (safeCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex ${starSizeClass}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ color: 'var(--color-border)' }}>★</span>
          ))}
        </div>
        {showCount && (
          <span
            className={`${textSizeClass} truncate max-w-[80px]`}
            style={{ color: 'var(--color-text-secondary)' }}
            title="Sin opiniones"
          >
            Sin opiniones
          </span>
        )}
      </div>
    );
  }

  const rounded = Math.round(safeAvg * 2) / 2;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${starSizeClass}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{ color: rounded >= i + 1 ? 'var(--color-warning)' : 'var(--color-border)' }}
          >
            ★
          </span>
        ))}
      </div>
      <span className={textSizeClass} style={{ color: 'var(--color-text-secondary)' }}>
        {safeAvg.toFixed(1)}
        {showCount && ` (${safeCount})`}
      </span>
    </div>
  );
}

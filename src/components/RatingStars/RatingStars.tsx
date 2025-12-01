// src/components/RatingStars.tsx
interface RatingStarsProps {
  avgRating?: number;     // promedio, ej: 4.8
  ratingCount?: number;   // cantidad de opiniones, ej: 12
  showCount?: boolean;    // mostrar "12 opiniones"
  size?: "sm" | "md";     // tamaño opcional
}

export function RatingStars({
  avgRating,
  ratingCount,
  showCount = true,
  size = "md",
}: RatingStarsProps) {
  const safeAvg = avgRating ?? 0;
  const safeCount = ratingCount ?? 0;

  const starSizeClass = size === "sm" ? "text-sm" : "text-base";
  const textSizeClass = size === "sm" ? "text-xs" : "text-sm";

  // 👉 Sin opiniones: estrellas grises vacías
  if (safeCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex ${starSizeClass}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-gray-300">
              ★
            </span>
          ))}
        </div>
        {showCount && (
          <span className={`${textSizeClass} text-gray-500`}>
            Sin opiniones
          </span>
        )}
      </div>
    );
  }

  // 👉 Con opiniones
  const rounded = Math.round(safeAvg * 2) / 2;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${starSizeClass}`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const filled = rounded >= starValue;

          return (
            <span
              key={i}
              className={filled ? "text-yellow-400" : "text-gray-300"}
            >
              ★
            </span>
          );
        })}
      </div>
      <span className={`${textSizeClass} text-gray-700`}>
        {safeAvg.toFixed(1)}
        {showCount && ` (${safeCount})`}
      </span>
    </div>
  );
}

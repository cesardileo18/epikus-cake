interface BadgeProps {
  children: React.ReactNode;
}

export function Badge({ children }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold shadow-md hover:shadow-lg transition-shadow"
      style={{
        border: '2px solid var(--color-brand)',
        background: 'var(--color-bg-card)',
        color: 'var(--color-brand)',
      }}
    >
      {children}
    </span>
  );
}

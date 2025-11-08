interface BadgeProps {
  children: React.ReactNode
}

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-pink-600 bg-white px-4 py-1.5 text-xs font-extrabold text-pink-600 shadow-md hover:shadow-lg transition-shadow">
      {children}
    </span>
  )
}
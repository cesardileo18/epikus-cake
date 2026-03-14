import { Badge } from "@/components/aboutUs/Badge" 

interface SectionHeaderProps {
  kicker?: string
  title: string
  desc?: string
}

export function SectionHeader({ kicker, title, desc }: SectionHeaderProps) {
  return (
    <header className="mb-8">
      {kicker && (
        <div className="mb-2">
          <Badge>{kicker}</Badge>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      {desc && <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>}
    </header>
  )
}
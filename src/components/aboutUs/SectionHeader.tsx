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
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">{title}</h2>
      {desc && <p className="mt-2 text-gray-600">{desc}</p>}
    </header>
  )
}
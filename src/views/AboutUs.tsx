// src/pages/AboutUs.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import {
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline'
import aboutJson from '@/content/aboutUsContent.json'
import type { AboutUsContent } from '@/interfaces/AboutUsContent'
// AboutUs — alineado a Home: contenedor `max-w-7xl mx-auto px-6` y secciones `py-20`
const content: AboutUsContent = aboutJson as AboutUsContent

const brand = { from: '#FF7BAC', to: '#D81E77' }

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ borderColor: '#FFD2E8', background: '#FFF1F7', color: brand.to }}
    >
      {children}
    </span>
  )
}

function SectionHeader({
  kicker,
  title,
  desc,
}: {
  kicker?: string
  title: string
  desc?: string
}) {
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

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-[#ff7bab48] text-gray-800">
      {/* HERO */}
      <section className="pt-22 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr,1fr]">
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                {content.hero.title_prefix}{' '}
                <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                  {content.hero.title_highlight}
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-gray-600">{content.hero.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={content.cta.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-sm hover:shadow"
                  style={{ background: `linear-gradient(90deg, ${brand.from}, ${brand.to})` }}
                >
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> {content.cta.whatsapp_label}
                </a>
                <Link
                  to={content.cta.contact_link}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  {content.cta.contact_label}
                </Link>
              </div>
            </div>

            {/* Tarjeta chef + foto */}
            <div className="relative">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                    <img
                      src={content.chef_card.image_src}
                      alt={content.chef_card.image_alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{content.chef_card.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{content.chef_card.bio}</p>
                    <ul className="mt-3 grid gap-2 text-sm text-gray-700">
                      {content.chef_card.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          {/* Icono alternado solo visual */}
                          {i === 0 && <ShieldCheckIcon className="h-4 w-4" />}
                          {i === 1 && <HeartIcon className="h-4 w-4" />}
                          {i === 2 && <SparklesIcon className="h-4 w-4" />}
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div
                className="pointer-events-none absolute -right-6 -top-6 -z-10 h-28 w-28 rounded-3xl opacity-20"
                style={{ background: `linear-gradient(90deg, ${brand.from}, ${brand.to})` }}
              />
            </div>
          </div>

          {/* Stats compactas */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {content.stats.map((s, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia con timeline */}
      <section className="border-t border-gray-100 bg-gray-50/60 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            kicker={content.history_section.kicker}
            title={content.history_section.title}
            desc={content.history_section.desc}
          />
          <div className="grid gap-10 md:grid-cols-2">
            {/* Línea temporal */}
            <ol className="relative space-y-6 before:absolute before:left-3 before:top-0 before:h-full before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[#FF7BAC] before:to-[#D81E77]">
              {content.history_section.timeline.map((t, i) => (
                <li key={i} className="relative pl-10">
                  <span
                    className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow ${
                      i % 2 === 0 ? 'bg-[#FF7BAC]' : 'bg-[#D81E77]'
                    }`}
                  />
                  <h4 className="font-semibold text-gray-900">{t.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
                </li>
              ))}
            </ol>

            {/* Imagen mosaico */}
            <div className="grid grid-cols-2 gap-4">
              {content.gallery.map((g, i) => (
                <img
                  key={i}
                  className={`${i === 2 ? 'col-span-2 h-56' : 'h-52'} w-full rounded-2xl object-cover shadow`}
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principios del obrador */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {content.principles.map((p, i) => {
              const Icon = i === 0 ? HeartIcon : i === 1 ? ShieldCheckIcon : SparklesIcon
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
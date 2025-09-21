// src/pages/AboutUs.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import {
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline'

// AboutUs — alineado a Home: contenedor `max-w-7xl mx-auto px-6` y secciones `py-20`

const brand = {
  from: '#FF7BAC',
  to: '#D81E77',
}

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
    <main className="min-h-screen bg-white text-gray-800">
      {/* HERO */}
      <section className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr,1fr]">
            <div>
              <Badge>Quiénes somos</Badge>
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                Repostería{' '}
                <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                  Familiar
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-gray-600">
                Somos una empresa familiar dedicada a la repostería, pastelería y panadería. Hacemos piezas a medida
                para que tus momentos sean únicos, con ingredientes reales y procesos cuidados.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/YOUR_PHONE_NUMBER"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-sm hover:shadow"
                  style={{ background: `linear-gradient(90deg, ${brand.from}, ${brand.to})` }}
                >
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> Consultar por WhatsApp
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Ver contacto
                </Link>
              </div>
            </div>

            {/* Tarjeta chef + foto */}
            <div className="relative">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                    <img
                      src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1758490880/chefEpikus_ccuqiv.jpg"
                      alt="Chef Epikus"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Alejandra · Chef Epikus</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Formación consolidada en el IAG (Argentina). Inspiración familiar y pasión por el detalle.
                    </p>
                    <ul className="mt-3 grid gap-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4" /> Higiene y técnica profesional
                      </li>
                      <li className="flex items-center gap-2">
                        <HeartIcon className="h-4 w-4" /> Sabores equilibrados, terminaciones prolijas
                      </li>
                      <li className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4" /> Diseños personalizados según tu evento
                      </li>
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
            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] bg-clip-text text-transparent">
                +6
              </p>
              <p className="text-sm text-gray-600">Años horneando profesionalmente</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] bg-clip-text text-transparent">
                100%
              </p>
              <p className="text-sm text-gray-600">Pedidos a medida</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] bg-clip-text text-transparent">
                48–72h
              </p>
              <p className="text-sm text-gray-600">Anticipación recomendada</p>
            </div>
          </div>
        </div>
      </section>

      {/* Historia con timeline */}
      <section className="border-t border-gray-100 bg-gray-50/60 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            kicker="Nuestra historia"
            title="De Maracay a CABA, con receta familiar y estudio"
            desc="Origen, formación y el presente de Epikus en una línea clara."
          />
          <div className="grid gap-10 md:grid-cols-2">
            {/* Línea temporal */}
            <ol className="relative space-y-6 before:absolute before:left-3 before:top-0 before:h-full before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[#FF7BAC] before:to-[#D81E77]">
              <li className="relative pl-10">
                <span className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-[#FF7BAC] shadow" />
                <h4 className="font-semibold text-gray-900">Origen – Maracay, Aragua (Venezuela)</h4>
                <p className="mt-1 text-sm text-gray-600">Aprendizaje con su abuela y primeras recetas caseras.</p>
              </li>
              <li className="relative pl-10">
                <span className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-[#D81E77] shadow" />
                <h4 className="font-semibold text-gray-900">2016 – Llegada a Argentina</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Estudios en el Instituto Argentino de Gastronomía (IAG) con referente Oswaldo Gross.
                </p>
              </li>
              <li className="relative pl-10">
                <span className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-[#FF7BAC] shadow" />
                <h4 className="font-semibold text-gray-900">Hoy – Epikus Cake</h4>
                <p className="mt-1 text-sm text-gray-600">Piezas a medida para eventos y celebraciones.</p>
              </li>
            </ol>

            {/* Imagen mosaico */}
            <div className="grid grid-cols-2 gap-4">
              <img
                className="h-52 w-full rounded-2xl object-cover shadow"
                src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1758492242/chocofresa_ddkpar.jpg"
                alt="Torta personalizada"
                loading="lazy"
                decoding="async"
              />
              <img
                className="h-52 w-full rounded-2xl object-cover shadow"
                src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1758492447/redvelvet_tlsqjf.jpg"
                alt="Proceso artesanal"
                loading="lazy"
                decoding="async"
              />
              <img
                className="col-span-2 h-56 w-full rounded-2xl object-cover shadow"
                src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1758491703/pandejamon_yk8ve8.jpg"
                alt="Decoración detallada"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Principios del obrador */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] text-white">
                <HeartIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Ingredientes reales</h3>
              <p className="mt-1 text-sm text-gray-600">Materias primas de calidad, sabores honestos y consistentes.</p>
            </div>
            <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] text-white">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Proceso cuidadoso</h3>
              <p className="mt-1 text-sm text-gray-600">Control de tiempos.</p>
            </div>
            <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7BAC] to-[#D81E77] text-white">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Diseño a medida</h3>
              <p className="mt-1 text-sm text-gray-600">Se adapta a tu temática, porciones y temporada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-gray-100 bg-gray-50/60 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">¿Coordinamos tu pedido?</h3>
              <p className="text-sm text-gray-600">
                Respondemos rápido por WhatsApp. También podés ver nuestros datos de contacto.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://wa.me/YOUR_PHONE_NUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:shadow"
                style={{ background: `linear-gradient(90deg, ${brand.from}, ${brand.to})` }}
              >
                <ChatBubbleBottomCenterTextIcon className="h-4 w-4" /> WhatsApp
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Ver contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Epikus Cake
      </footer>
    </main>
  )
}

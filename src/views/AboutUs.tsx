// src/pages/AboutUs.tsx
import { Link } from "react-router-dom";
import {
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

import { SectionHeader } from "@/components/aboutUs/SectionHeader";
import { InstagramSection } from "@/components/aboutUs/InstagramSection";

import aboutJson from "@/content/aboutUsContent.json";
import type { AboutUsContent } from "@/interfaces/AboutUsContent";

const content: AboutUsContent = aboutJson as AboutUsContent;
const brand = { from: "#FF7BAC", to: "#D81E77" };

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 text-gray-800 relative overflow-hidden">
      {/* Círculos decorativos animados */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      {/* HERO */}
      <section className="pt-22 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr,1fr]">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                {content.hero.title_prefix}{" "}
                <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text">
                  {content.hero.title_highlight}
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-gray-700 text-lg">
                {content.hero.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={content.cta.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce-subtle"
                  style={{ background: `linear-gradient(90deg, ${brand.from}, ${brand.to})` }}
                >
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />{" "}
                  {content.cta.whatsapp_label}
                </a>
                <Link
                  to={content.cta.contact_link}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-pink-600 shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/60 hover:scale-110 transition-all duration-300"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  {content.cta.contact_label}
                </Link>
              </div>
            </div>

            {/* Tarjeta chef animada */}
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="rounded-3xl border-2 border-pink-200 bg-white p-6 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-opacity-95">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-200 to-rose-200 ring-2 ring-pink-300 ring-offset-2">
                    <img
                      src={content.chef_card.image_src}
                      alt={content.chef_card.image_alt}
                      className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {content.chef_card.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {content.chef_card.bio}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 grid gap-2 text-sm text-gray-700">
                  {content.chef_card.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 hover:translate-x-1 transition-transform duration-200"
                    >
                      {i === 0 && (
                        <ShieldCheckIcon className="h-4 w-4 shrink-0 text-pink-500" />
                      )}
                      {i === 1 && (
                        <HeartIcon className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      {i === 2 && (
                        <SparklesIcon className="h-4 w-4 shrink-0 text-pink-500" />
                      )}
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="pointer-events-none absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-3xl opacity-40 animate-pulse"
                style={{ background: `linear-gradient(135deg, ${brand.from}, ${brand.to})` }}
              />
            </div>
          </div>

          {/* Stats animadas */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {content.stats.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-pink-200 bg-white p-6 text-center shadow-lg hover:shadow-2xl hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer group"
              >
                <p className="text-4xl font-black bg-gradient-to-r from-[#FF7BAC] via-[#F06292] to-[#D81E77] bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {s.value}
                </p>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="border-t-2 border-pink-200 bg-white/50 backdrop-blur-sm py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            kicker={content.history_section.kicker}
            title={content.history_section.title}
            desc={content.history_section.desc}
          />

          <div className="grid gap-10 md:grid-cols-2">
            <ol className="relative space-y-6 before:absolute before:left-3 before:top-0 before:h-full before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[#FF7BAC] before:to-[#D81E77] before:animate-pulse">
              {content.history_section.timeline.map((t, i) => (
                <li
                  key={i}
                  className="relative pl-10 animate-fade-in-right"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span
                    className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow-lg hover:scale-125 transition-transform ${
                      i % 2 === 0 ? "bg-[#FF7BAC]" : "bg-[#D81E77]"
                    }`}
                  />
                  <h4 className="font-bold text-gray-900">{t.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-2 gap-4">
              {content.gallery.map((g, i) => (
                <img
                  key={i}
                  className={`${
                    i === 2 ? "col-span-2 h-56" : "h-52"
                  } w-full rounded-2xl object-cover shadow-lg hover:shadow-2xl hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-pink-300`}
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

      {/* Principios */}
      <section className="py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {content.principles.map((p, i) => {
              const Icon =
                i === 0 ? HeartIcon : i === 1 ? ShieldCheckIcon : SparklesIcon;
              return (
                <div
                  key={i}
                  className="group rounded-3xl border-2 border-pink-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7BAC] to-[#D81E77] text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Instagram (usando tu componente reutilizable) */}
      <InstagramSection instagram={content.instagram} />
    </main>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import termsJson from "@/content/TermsContent.json";
import type { TermsContent } from "@/interfaces/TermsContent";

const content: TermsContent = termsJson as TermsContent;

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Hero */}
      <section className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-rose-400/5 to-pink-600/10" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-20 pb-10">
          <div className="text-center space-y-4">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full font-semibold">
              {content.hero.badge}
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900">
              {content.hero.title_prefix}{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                {content.hero.title_highlight}
              </span>
            </h1>
            <p
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{ __html: content.hero.subtitle_html }}
            />
          </div>
        </div>

        {/* Orbes decorativos */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-300 rounded-full opacity-20 animate-bounce" />
        <div className="absolute bottom-12 right-10 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full opacity-25 animate-bounce" />
      </section>

      {/* Contenido */}
      <section className="relative py-10">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          {content.sections.map((s, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{s.title}</h2>
              {s.items ? (
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                  {s.items.map((li, idx) => <li key={idx}>{li}</li>)}
                </ul>
              ) : s.text ? (
                <p className="text-gray-700">{s.text}</p>
              ) : null}
              {s.title.startsWith("6.") && (
                <p className="mt-4 text-sm text-gray-500">
                  {content.meta.last_update_label} {content.meta.last_update_value}
                </p>
              )}
            </div>
          ))}

          {/* CTA / Volver */}
          <div className="text-center pt-2">
            <Link
              to={content.routes.home}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {content.cta.back_home}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;

interface InstagramSectionProps {
  instagram: {
    title: string
    handle: string
    url: string
    cta_label: string
    qr_src: string
  }
}

export function InstagramSection({ instagram }: InstagramSectionProps) {
  return (
    <section className="pb-10 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 animate-gradient-shift" />

          <div
            className="absolute inset-0 opacity-20 animate-slide"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          <div className="relative grid md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-12 items-center">
            <div className="text-center md:text-left space-y-5">
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl animate-bounce-subtle">
                {instagram.title}
              </h2>

              <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur rounded-full px-6 py-3 shadow-2xl hover:scale-105 transition-transform duration-300 animate-wiggle">
                <span className="text-2xl animate-spin-slow">📸</span>
                <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  @{instagram.handle}
                </span>
              </div>

              <div className="flex justify-center md:justify-start">
                <a
                  href={instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-pink-600 font-black px-8 py-4 rounded-2xl shadow-2xl hover:shadow-pink-500/50 hover:scale-110 transition-all duration-300"
                >
                  <span>{instagram.cta_label}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              <p className="text-white/95 text-sm font-bold drop-shadow">
                También podés escanear el QR →
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative animate-float">
                <div className="absolute -inset-6 bg-white/30 blur-3xl rounded-3xl animate-pulse" />

                <div className="relative bg-white rounded-3xl p-6 shadow-2xl hover:scale-110 hover:rotate-3 transition-all duration-500 border-4 border-pink-200">
                  <img
                    src={instagram.qr_src}
                    alt={`QR Instagram @${instagram.handle}`}
                    className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px] rounded-2xl object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-2xl animate-bounce-subtle">
                    ¡Escaneame!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
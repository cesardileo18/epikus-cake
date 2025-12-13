import React, { useState, useRef, useEffect } from 'react';
import type { ReactionVideosSectionProps } from '@/interfaces/customVideos';

const ReactionVideosSection: React.FC<ReactionVideosSectionProps> = ({ videos }) => {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // Cargar frame inicial de preview (seguro)
    useEffect(() => {
        videoRefs.current.forEach(video => {
            if (video && video.readyState >= 1) {
                try {
                    video.currentTime = 0.1;
                } catch {
                    // noop
                }
            }
        });
    }, []);

    const handleOpenVideo = (src: string) => {
        // Pausar previews
        videoRefs.current.forEach(v => v?.pause());
        setSelectedVideo(src);
    };

    return (
        <section>
            <div className="max-w-6xl mx-auto py-5 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
                        Momentos que{' '}
                        <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                            emocionan
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">
                        Reacciones reales y trabajos hechos a pedido.
                    </p>
                </div>

                {/* Grid de videos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {videos.map((video, index) => (
                        <button
                            key={video.id}
                            onClick={() => handleOpenVideo(video.src)}
                            className="
                group relative
                rounded-3xl
                p-[2px]
                bg-gradient-to-br from-pink-400/70 to-rose-300/70
                shadow-lg hover:shadow-2xl
                transition-all duration-300
                transform hover:scale-[1.02]
                focus:outline-none focus:ring-2 focus:ring-pink-400
              "
                        >
                            {/* Marco interno */}
                            <div className="rounded-[22px] overflow-hidden bg-black">
                                {/* Altura controlada */}
                                <div className="
                  relative
                  h-[420px] sm:h-[380px] md:h-[340px] lg:h-[320px]
                  bg-gradient-to-br from-gray-900 to-gray-800
                ">
                                    <video
                                        ref={el => (videoRefs.current[index] = el)}
                                        src={video.src}
                                        className="w-full h-full object-cover"
                                        preload="metadata"
                                        muted
                                        playsInline
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

                                    {/* Play */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="
                      w-18 h-18 md:w-20 md:h-20
                      bg-white/95 backdrop-blur
                      rounded-full
                      flex items-center justify-center
                      shadow-2xl
                      transform group-hover:scale-110
                      transition-transform duration-300
                    ">
                                            <svg
                                                className="w-8 h-8 md:w-9 md:h-9 text-pink-500 ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal fullscreen */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                    onClick={() => setSelectedVideo(null)}
                >
                    {/* Cerrar */}
                    <button
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors group"
                        aria-label="Cerrar"
                    >
                        <svg
                            className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Video */}
                    <div
                        className="
    w-full
    max-w-sm
    max-h-[85vh]
    aspect-[9/16]
    bg-black
    rounded-xl
    overflow-hidden
    shadow-2xl
  "
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src={selectedVideo}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>

                </div>
            )}
        </section>
    );
};

export default ReactionVideosSection;

import { ChevronLeft, ChevronRight, Users, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import CtaButton from './cta-button';
import { useAnalytics } from '@/hooks/use-analytics';

const gridImages = Array.from({ length: 4 }, (_, i) => ({
    id: `grid-${i + 1}`,
    src: `/storage/testimoni/testi${i + 1}.webp`,
    alt: `Testimoni pelanggan ${i + 1}`,
}));

const carouselImages = Array.from({ length: 8 }, (_, i) => ({
    id: `carousel-${i + 1}`,
    src: `/storage/testimoni/testi${i + 5}.webp`,
    alt: `Testimoni pelanggan ${i + 5}`,
}));

const allImages = [...gridImages, ...carouselImages];

function Lightbox({
    images,
    currentIndex,
    onClose,
    onNavigate,
}: {
    images: typeof allImages;
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}) {
    const touchStartX = useRef(0);
    const touchDeltaX = useRef(0);
    const [dragOffset, setDragOffset] = useState(0);
    const isDragging = useRef(false);

    const goNext = useCallback(() => {
        onNavigate((currentIndex + 1) % images.length);
    }, [currentIndex, images.length, onNavigate]);

    const goPrev = useCallback(() => {
        onNavigate((currentIndex - 1 + images.length) % images.length);
    }, [currentIndex, images.length, onNavigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, goNext, goPrev]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        isDragging.current = true;
        setDragOffset(0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
        setDragOffset(touchDeltaX.current);
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        const threshold = 60;

        if (touchDeltaX.current < -threshold) {
            goNext();
        } else if (touchDeltaX.current > threshold) {
            goPrev();
        }

        touchDeltaX.current = 0;
        setDragOffset(0);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Tutup"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Prev button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                }}
                className="absolute left-2 z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4 sm:p-3"
                aria-label="Sebelumnya"
            >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Next button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                }}
                className="absolute right-2 z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4 sm:p-3"
                aria-label="Berikutnya"
            >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Image */}
            <div
                className="flex max-h-[85vh] w-full max-w-lg items-center justify-center px-14 sm:px-20"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    src={images[currentIndex].src}
                    alt={images[currentIndex].alt}
                    className="max-h-[85vh] w-full rounded-2xl object-contain shadow-2xl transition-transform duration-200"
                    style={{
                        transform: `translateX(${dragOffset}px)`,
                    }}
                    draggable={false}
                />
            </div>
        </div>
    );
}

export default function Testimonials() {
    const { trackCTA } = useAnalytics();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = (globalIndex: number) => {
        setLightboxIndex(globalIndex);
    };

    return (
        <section id="testimoni" className="bg-lp-blue-50/50 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-lp-blue-100 px-4 py-2">
                        <Users className="h-5 w-5 text-lp-blue-600" />
                        <span className="text-sm font-semibold text-lp-blue-700">
                            7.000+ Orang Sudah Bergabung
                        </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl lg:text-4xl">
                        Dipercaya oleh ribuan
                        <br />
                        pebisnis pemula di seluruh Indonesia
                    </h2>
                    <p className="mt-4 text-base text-lp-slate-500 sm:text-lg">
                        Ini kata mereka yang sudah merasakan manfaatnya.
                    </p>
                </div>

                {/* 2x2 Image Grid */}
                <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:mt-16 sm:gap-4">
                    {gridImages.map((img, i) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => openLightbox(i)}
                            className="aspect-square cursor-pointer overflow-hidden rounded-xl shadow-sm transition-transform duration-200 hover:scale-[1.02] sm:rounded-2xl"
                        >
                            <img
                                src={img.src}
                                alt={img.alt}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>

                {/* Horizontal Carousel */}
                <div className="mt-6 overflow-hidden sm:mt-8">
                    <div className="animate-carousel flex gap-3 sm:gap-4">
                        {/* Duplicate images for seamless infinite loop */}
                        {[...carouselImages, ...carouselImages].map(
                            (img, index) => {
                                const globalIndex =
                                    gridImages.length +
                                    (index % carouselImages.length);

                                return (
                                    <button
                                        key={`${img.id}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            openLightbox(globalIndex)
                                        }
                                        className="aspect-square w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl shadow-sm transition-transform duration-200 hover:scale-[1.03] sm:w-40 md:w-48 lg:w-52"
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                <div className="mt-12 sm:mt-14">
                    <CtaButton id="testimonial-cta" onClick={() => trackCTA('testimonials_section', 'Dapatkan Panduannya Sekarang', '#harga')} />
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <Lightbox
                    images={allImages}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </section>
    );
}

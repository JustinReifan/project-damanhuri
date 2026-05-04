import { BookOpen, Table } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

import CtaButton from './cta-button';

export default function Hero() {
    const { trackCTA } = useAnalytics();

    const handleCtaClick = () => {
        trackCTA('hero_section', 'Dapatkan Panduannya Sekarang', '#harga');
    };

    return (
        <section
            id="hero"
            className="relative overflow-hidden bg-gradient-to-b from-lp-blue-50 via-lp-blue-50/50 to-white pt-24 pb-16 sm:pt-32 sm:pb-24"
        >
            {/* Decorative background elements */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-lp-blue-200/30 blur-3xl" />
                <div className="absolute bottom-10 left-0 h-64 w-64 rounded-full bg-lp-yellow-200/20 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left: Copy */}
                    <div className="animate-fade-in-up text-center lg:text-left">
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-lp-blue-100 px-4 py-1.5 text-sm font-medium text-lp-blue-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-lp-blue-500" />
                            Panduan Praktis Bangun Bisnis
                        </span>

                        <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-lp-slate-900 sm:text-4xl lg:text-5xl">
                            Cara{' '}
                            <span className="text-lp-blue-600">
                                {' '}
                                Paling Masuk Akal
                            </span>{' '}
                            Membangun Bisnis Pertama Tanpa{' '}
                            <span className="text-lp-blue-600">
                                Perlu Takut Salah Langkah
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-lp-slate-600 sm:text-lg lg:mx-0">
                            Bukan kelas motivasi. Ini adalah panduan
                            step-by-step bangun bisnis yang bisa kamu praktekkan
                            langsung dari nol sampai punya ratusan pembeli.
                        </p>

                        <div className="mt-8 flex justify-center sm:mt-10 lg:justify-start">
                            <CtaButton id="hero-cta" onClick={handleCtaClick} />
                        </div>
                    </div>

                    {/* Right: Product mockup */}
                    <div className="animate-fade-in-up [animation-delay:200ms]">
                        <div className="relative mx-auto max-w-md lg:max-w-none">
                            {/* Blue glow behind card */}
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-lp-blue-400/20 via-lp-blue-300/10 to-lp-blue-200/5 blur-2xl" />

                            {/* Main mockup card */}
                            <div className="relative rounded-2xl border border-lp-blue-200/60 bg-gradient-to-br from-white via-white to-lp-blue-50/80 p-6 shadow-xl shadow-lp-blue-900/10 sm:p-8">
                                {/* Decorative dot pattern */}
                                <div className="pointer-events-none absolute top-3 right-3 grid grid-cols-3 gap-1.5 opacity-30">
                                    {[...Array(9)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-1 w-1 rounded-full bg-lp-blue-400"
                                        />
                                    ))}
                                </div>

                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-lp-blue-400" />
                                    <div className="h-3 w-3 rounded-full bg-lp-yellow-400" />
                                    <div className="h-3 w-3 rounded-full bg-lp-slate-300" />
                                </div>

                                {/* Course preview */}
                                <div className="mb-4 aspect-video overflow-hidden rounded-xl ring-2 ring-lp-blue-200/20">
                                    <img
                                        src="/storage/thumb/produk.png"
                                        alt="Panduan 23 Langkah Bangun Bisnis Lokal"
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Feature pills */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 rounded-lg border border-lp-blue-100 bg-lp-blue-50 px-3 py-2.5">
                                        <Table className="h-4 w-4 text-lp-blue-600" />
                                        <span className="text-xs font-medium text-lp-blue-800">
                                            80+ Sheet Spreadsheet
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border border-lp-yellow-200 bg-lp-yellow-50 px-3 py-2.5">
                                        <BookOpen className="h-4 w-4 text-lp-yellow-600" />
                                        <span className="text-xs font-medium text-lp-yellow-600">
                                            70+ Halaman E-book
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating accent card */}
                            <div className="absolute -right-3 -bottom-3 rounded-xl border border-lp-yellow-300 bg-lp-yellow-50 px-4 py-2.5 shadow-md sm:-right-4 sm:-bottom-4">
                                <p className="text-xs font-semibold text-lp-yellow-600">
                                    🎁 BONUS: 13 Strategi Penjualan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

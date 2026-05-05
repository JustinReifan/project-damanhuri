import { BookOpen, Gift, PlayCircle, Table } from 'lucide-react';

import CtaButton from './cta-button';
import { useAnalytics } from '@/hooks/use-analytics';

const deliverables = [
    {
        icon: PlayCircle,
        title: '40+ Video Tutorial',
        description:
            'Video langkah demi langkah yang menjelaskan setiap tahap membangun bisnis. Dibuat dengan bahasa yang sederhana dan mudah diikuti.',
        color: 'blue' as const,
        image: '/storage/thumb/video.webp',
    },
    {
        icon: Table,
        title: '80+ Sheet Spreadsheet Template',
        description:
            'Template Google Spreadsheet yang tinggal kamu isi. Dari riset pasar, strategi komunikasi, sampai cara jualan.',
        color: 'blue' as const,
        image: '/storage/thumb/spreadsheet.webp',
    },
    {
        icon: BookOpen,
        title: '70+ Halaman E-book',
        description:
            'Rangkuman lengkap semua materi dalam bentuk PDF yang bisa kamu baca dimana saja & kapan saja.',
        color: 'blue' as const,
        image: '/storage/thumb/ebook.webp',
    },
];

const colorMap = {
    blue: {
        iconBg: 'bg-lp-blue-50',
        iconColor: 'text-lp-blue-600',
        border: 'border-lp-blue-100',
    },
};

export default function ValueStack() {
    const { trackCTA } = useAnalytics();

    return (
        <section id="materi" className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="mb-3 inline-block text-sm font-medium text-lp-blue-600">
                        Apa yang Kamu Dapatkan
                    </span>
                    <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl lg:text-4xl">
                        Semua yang kamu butuhkan
                        <br />
                        untuk mulai bisnis
                    </h2>
                </div>

                {/* Main deliverables */}
                <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-3">
                    {deliverables.map((item) => {
                        const colors = colorMap[item.color];
                        return (
                            <div
                                key={item.title}
                                className={`rounded-2xl border ${colors.border} bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-lp-blue-900/5 sm:p-8`}
                            >
                                <div className="mb-5 aspect-[4/3] overflow-hidden rounded-xl">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div
                                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${colors.iconBg}`}
                                >
                                    <item.icon
                                        className={`h-5 w-5 ${colors.iconColor}`}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-lp-slate-800">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-lp-slate-500">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Bonus card */}
                <div className="mt-6">
                    <div className="rounded-2xl border-2 border-lp-yellow-300 bg-gradient-to-r from-lp-yellow-50 to-lp-yellow-100/50 p-6 sm:p-8">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-lp-yellow-400">
                                <Gift className="h-7 w-7 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <span className="mb-1 inline-block rounded-full bg-lp-yellow-400 px-3 py-0.5 text-xs font-semibold text-white">
                                    BONUS
                                </span>
                                <h3 className="mt-2 text-lg font-semibold text-lp-slate-800">
                                    13 Strategi Penjualan (Video & Spreadsheet)
                                </h3>
                                <p className="mt-1 text-sm leading-relaxed text-lp-slate-500">
                                    Kumpulan strategi penjualan yang terbukti
                                    efektif untuk bisnis pemula. Lengkap dengan
                                    template implementasinya.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 sm:mt-14">
                    <CtaButton id="value-cta" onClick={() => trackCTA('value_stack_section', 'Dapatkan Panduannya Sekarang', '#harga')} />
                </div>
            </div>
        </section>
    );
}

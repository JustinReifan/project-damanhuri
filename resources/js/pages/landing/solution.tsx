import { CheckCircle, MessageCircle, Table, TrendingUp } from 'lucide-react';

import CtaButton from './cta-button';
import { useAnalytics } from '@/hooks/use-analytics';

const steps = [
    { number: '01', label: 'Tentukan Produk' },
    { number: '02', label: 'Research and Development' },
    { number: '03', label: 'Buat SOP' },
    { number: '...', label: '' },
    { number: '23', label: 'Kelola Loyal Customer' },
];

const features = [
    {
        icon: Table,
        title: 'Langsung Praktek di Spreadsheet',
        description:
            'Setiap langkah punya spreadsheet template siap pakai. Kamu tinggal isi, dan rencana bisnismu langsung jadi.',
    },
    {
        icon: MessageCircle,
        title: 'Bahasa yang Gampang Dipahami',
        description:
            'Nggak pakai istilah ribet. Saya jelaskan semuanya pakai bahasa sehari-hari kayak lagi ngobrol sama temen.',
    },
    {
        icon: TrendingUp,
        title: 'Dari Nol Sampai Punya Pembeli',
        description:
            'Fokusnya bukan teori. Panduan ini dirancang supaya kamu bisa benar-benar jalankan bisnis dan dapat pembeli.',
    },
];

export default function Solution() {
    const { trackCTA } = useAnalytics();

    return (
        <section id="solusi" className="bg-lp-blue-50/50 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="mb-3 inline-block text-sm font-medium text-lp-blue-600">
                        Solusinya ada disini
                    </span>
                    <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl lg:text-4xl">
                        Kenalan dengan Blueprint
                        <br />
                        <span className="text-lp-blue-600">
                            Bangun Bisnis dari Nol
                        </span>
                    </h2>
                    <p className="mt-4 text-base text-lp-slate-500 sm:text-lg">
                        23 panduan bisnis lengkap yang membimbingmu step-by-step
                        dari &quot;bingung mulai dari mana&quot; sampai punya
                        bisnis yang bisa hasilkan jutaan rupiah per bulan.
                    </p>
                </div>

                {/* Step path visualization */}
                <div className="mx-auto mt-12 max-w-2xl sm:mt-16">
                    <div className="flex flex-col gap-0">
                        {steps.map((step, index) => (
                            <div
                                key={step.number}
                                className="flex items-stretch gap-4"
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                            step.number === '23'
                                                ? 'bg-lp-yellow-400 text-lp-slate-900'
                                                : step.number === '...'
                                                  ? 'border-2 border-dashed border-lp-blue-300 bg-white text-lp-blue-400'
                                                  : 'bg-lp-blue-600 text-white'
                                        }`}
                                    >
                                        {step.number === '...'
                                            ? '···'
                                            : step.number}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`w-0.5 grow ${step.number === '...' ? 'border-l-2 border-dashed border-lp-blue-200' : 'bg-lp-blue-200'}`}
                                        />
                                    )}
                                </div>
                                <div
                                    className={`pb-8 ${step.label ? '' : 'pb-4'}`}
                                >
                                    {step.label && (
                                        <p className="pt-2 text-sm font-medium text-lp-slate-700 sm:text-base">
                                            {step.label}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-lp-yellow-300 bg-lp-yellow-50 p-4">
                        <CheckCircle className="h-5 w-5 shrink-0 text-lp-yellow-600" />
                        <p className="text-sm font-medium text-lp-yellow-600">
                            Setiap langkah punya video tutorial + spreadsheet
                            template yang siap kamu isi
                        </p>
                    </div>
                </div>

                {/* 3 Key features */}
                <div className="mt-14 grid gap-8 sm:mt-16 sm:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.title} className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lp-blue-600 shadow-sm">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-base font-semibold text-lp-slate-800">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-lp-slate-500">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 sm:mt-14">
                    <CtaButton id="solution-cta" onClick={() => trackCTA('solution_section', 'Dapatkan Panduannya Sekarang', '#harga')} />
                </div>
            </div>
        </section>
    );
}

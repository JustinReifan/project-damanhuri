import {
    BookOpen,
    Check,
    Gift,
    PlayCircle,
    ShieldCheck,
    Table,
} from 'lucide-react';

import CtaButton from './cta-button';
import { useAnalytics } from '@/hooks/use-analytics';

const valueItems = [
    { icon: PlayCircle, label: '40+ Video Tutorial', value: 'Rp 500.000' },
    {
        icon: Table,
        label: '80+ Sheet Spreadsheet Template',
        value: 'Rp 300.000',
    },
    { icon: BookOpen, label: '70+ Halaman E-book PDF', value: 'Rp 200.000' },
    { icon: Gift, label: 'BONUS: 13 Strategi Penjualan', value: 'Rp 150.000' },
];

export default function Pricing() {
    const { trackCTA, trackConversion } = useAnalytics();

    return (
        <section id="harga" className="bg-lp-slate-50 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center">
                    <span className="mb-3 inline-block text-sm font-medium text-lp-blue-600">
                        Mulai Belajar Sekarang
                    </span>
                    <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl lg:text-4xl">
                        Investasi Sekali
                        <br />
                        Manfaat Selamanya{' '}
                    </h2>
                </div>

                {/* Pricing Card */}
                <div className="mt-10 overflow-hidden rounded-2xl border border-lp-slate-200 bg-white shadow-lg shadow-lp-slate-900/5 sm:mt-14">
                    {/* Value list */}
                    <div className="p-6 sm:p-8">
                        <p className="mb-5 text-xs font-semibold tracking-wider text-lp-slate-400 uppercase">
                            Yang kamu dapatkan
                        </p>
                        <ul className="space-y-4">
                            {valueItems.map((item) => (
                                <li
                                    key={item.label}
                                    className="flex items-center justify-between"
                                >
                                    <span className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4 shrink-0 text-lp-blue-500" />
                                        <span className="text-sm text-lp-slate-700 sm:text-base">
                                            {item.label}
                                        </span>
                                    </span>
                                    <span className="text-sm text-lp-slate-400 line-through">
                                        {item.value}
                                    </span>
                                </li>
                            ))}
                            <li
                                key={'garansi'}
                                className="flex items-center justify-between"
                            >
                                <span className="flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4 shrink-0 text-lp-blue-500" />
                                    <span className="text-sm text-lp-slate-700 sm:text-base">
                                        Garansi Kepuasan Uang Kembali 100%
                                    </span>
                                </span>
                            </li>
                        </ul>

                        {/* Total */}
                        <div className="mt-5 flex items-center justify-between border-t border-dashed border-lp-slate-200 pt-5">
                            <span className="text-sm font-medium text-lp-slate-500">
                                Total Nilai
                            </span>
                            <span className="text-base font-semibold text-lp-slate-400 line-through">
                                Rp 1.150.000
                            </span>
                        </div>
                    </div>

                    {/* Price highlight */}
                    <div className="bg-lp-blue-600 px-6 py-8 text-center sm:px-8 sm:py-10">
                        <p className="text-sm font-medium text-lp-blue-200">
                            Kamu hanya investasi
                        </p>

                        {/* Price */}
                        <div className="mt-3">
                            <span className="text-lg text-lp-blue-300 line-through sm:text-xl">
                                Rp 299.000
                            </span>
                            <p className="mt-1 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                                Rp 97.000
                            </p>
                        </div>

                        <p className="mt-3 text-sm text-lp-blue-200">
                            Sekali bayar · Akses selamanya
                        </p>

                        {/* Urgency */}
                        <p className="mt-3 text-xs font-medium text-lp-yellow-300">
                            ⏳ Harga khusus bulan Mei
                        </p>

                        <div className="mt-8">
                            <CtaButton
                                id="pricing-cta"
                                variant="secondary"
                                context="dark"
                                size="large"
                                text="Ya, Saya Mau Panduannya!"
                                href="https://damanhuri.com/pembayaran"
                                onClick={() => {
                                    trackCTA(
                                        'pricing_section',
                                        'Ya, Saya Mau Panduannya!',
                                        'https://damanhuri.com/pembayaran',
                                    );
                                    trackConversion('cta_lead', {
                                        source: 'pricing_section',
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

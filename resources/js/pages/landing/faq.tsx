import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import CtaButton from './cta-button';
import { useAnalytics } from '@/hooks/use-analytics';

const faqItems = [
    {
        question: 'Apakah saya bisa diskusi setelah pembelian?',
        answer: 'Tentu saja bisa! Setelah kamu membeli panduan, kamu bisa berdiskusi dengan saya terkait materi melalui DM Instagram atau Email.',
    },
    {
        question: 'Apakah cocok untuk yang benar-benar pemula?',
        answer: 'Sangat cocok! Panduan ini memang dirancang khusus untuk pemula yang baru mau mulai bisnis. Semua materi dijelaskan dari dasar, tanpa asumsi kamu sudah tahu apapun sebelumnya. Bahasa yang dipakai juga sederhana dan mudah dimengerti.',
    },
    {
        question: 'Saya tidak paham teknologi, apakah bisa mengikuti?',
        answer: 'Bisa! Kamu hanya perlu tahu cara menggunakan Google Spreadsheet dan menonton video. Jika kamu bisa membuka YouTube dan mengetik di komputer atau HP, kamu sudah cukup siap. Setiap langkah dijelaskan secara detail di video tutorial.',
    },
    {
        question: 'Berapa lama akses materinya?',
        answer: 'Kamu mendapatkan akses selamanya. Sekali bayar, semua materi — video, spreadsheet, dan e-book — bisa kamu akses kapan saja tanpa batas waktu. Termasuk semua update materi di masa depan.',
    },
    {
        question: 'Apakah ada garansi uang kembali?',
        answer: 'Ya, ada 100% garansi uang kembali. Kalau kamu merasa panduan ini tidak sesuai dengan ekspektasimu, saya kembalikan uangmu tanpa pertanyaan dan tanpa ribet.',
    },
    {
        question: 'Bagaimana cara aksesnya setelah bayar?',
        answer: 'Setelah pembayaran berhasil, kamu akan langsung mendapatkan akses ke semua materi. Video tutorial, template spreadsheet, dan e-book bisa langsung kamu akses dan mulai pelajari.',
    },
    {
        question: 'Apakah ini semacam skema cepat kaya?',
        answer: 'Bukan, sama sekali bukan. Panduan ini adalah buku panduan praktis yang mengajarkan langkah-langkah fundamental membangun bisnis lokal. Hasilnya bergantung pada usaha dan konsistensi kamu. Saya tidak pernah menjanjikan kekayaan instan — yang saya tawarkan adalah ilmu dan alat bantu yang benar.',
    },
    {
        question:
            'Apakah panduan ini cocok untuk membangun bisnis skala besar atau korporat?',
        answer: 'Tidak. Panduan ini berfokus untuk bangun Bisnis Lokal dan Small Business dari nol. Saya sengaja menghindari teori korporat yang rumit agar kamu bisa langsung fokus pada langkah praktis dan bisa segera mendapatkan pembeli pertama',
    },
];

export default function Faq() {
    const { trackCTA } = useAnalytics();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="bg-lp-slate-50 py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="mb-3 inline-block text-sm font-medium text-lp-blue-600">
                        Pertanyaan Umum
                    </span>
                    <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl lg:text-4xl">
                        Mungkin kamu ingin bertanya
                    </h2>
                </div>

                {/* Accordion */}
                <div className="mt-12 space-y-3 sm:mt-16">
                    {faqItems.map((item, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-xl border border-lp-slate-200 bg-white transition-all duration-200"
                        >
                            <button
                                id={`faq-item-${index}`}
                                onClick={() => toggle(index)}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-lp-slate-50 sm:px-6"
                            >
                                <span className="text-sm font-semibold text-lp-slate-800 sm:text-base">
                                    {item.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 shrink-0 text-lp-slate-400 transition-transform duration-300 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <div
                                className={`grid transition-all duration-300 ease-in-out ${
                                    openIndex === index
                                        ? 'grid-rows-[1fr] opacity-100'
                                        : 'grid-rows-[0fr] opacity-0'
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-5 pb-4 text-sm leading-relaxed text-lp-slate-500 sm:px-6">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 sm:mt-14">
                    <CtaButton id="faq-cta" onClick={() => trackCTA('faq_section', 'Dapatkan Panduannya Sekarang', '#harga')} />
                </div>
            </div>
        </section>
    );
}

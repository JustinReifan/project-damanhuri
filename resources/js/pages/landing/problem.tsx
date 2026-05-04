import { X } from 'lucide-react';

const painPoints = [
    'Bingung harus belajar ke siapa dan mulai dari mana.',
    'Takut salah langkah dan buang waktu',
    'Takut gagal/rugi padahal modal terbatas',
    'Nggak punya panduan yang jelas dan step-by-step',
    'Informasi di internet terlalu banyak, malah makin bingung',
    'Udah lama niat mulai bisnis, tapi masih terus nunda',
];

export default function Problem() {
    return (
        <section id="masalah" className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl lg:text-4xl">
                        Saya tahu kamu pengen mulai bisnis sendiri,
                        <span className="font-semibold text-lp-blue-600">
                            {' '}
                            Tapi masalahnya:{' '}
                        </span>
                    </h2>
                </div>

                <ul className="mx-auto mt-10 max-w-xl space-y-4 sm:mt-12">
                    {painPoints.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 md:h-7 md:w-7">
                                <X className="h-3.5 w-3.5 text-red-400 md:h-5 md:w-5" />
                            </span>
                            <span className="text-base text-lp-slate-700 md:text-lg">
                                {point}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

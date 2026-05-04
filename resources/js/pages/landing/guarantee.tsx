import { ShieldCheck } from 'lucide-react';

export default function Guarantee() {
    return (
        <section id="garansi" className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lp-blue-50">
                    <ShieldCheck className="h-10 w-10 text-lp-blue-600" />
                </div>

                <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl">
                    100% Garansi Uang Kembali
                </h2>

                <p className="mt-4 text-base leading-relaxed text-lp-slate-600 sm:text-lg">
                    Saya sangat yakin dengan kualitas panduan ini. Kalau setelah
                    kamu pelajari ternyata kamu merasa panduan ini tidak sesuai
                    dengan ekspektasimu, saya kembalikan uangmu{' '}
                    <span className="font-semibold text-lp-slate-800">
                        tanpa ribet.
                    </span>
                </p>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-lp-blue-200 bg-lp-blue-50 px-5 py-2">
                    <ShieldCheck className="h-4 w-4 text-lp-blue-600" />
                    <span className="text-sm font-medium text-lp-blue-700">
                        Garansi Kepuasan 100%
                    </span>
                </div>
            </div>
        </section>
    );
}

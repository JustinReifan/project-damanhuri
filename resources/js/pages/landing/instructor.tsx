import { Heart, MessageCircle, Target } from 'lucide-react';

export default function Instructor() {
    return (
        <section id="pengajar" className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-5 lg:gap-16">
                    {/* Left: Avatar image */}
                    <div className="flex justify-center lg:col-span-2">
                        <div className="relative">
                            <div className="h-56 w-56 overflow-hidden rounded-2xl shadow-lg sm:h-80 sm:w-80">
                                <img
                                    src="/storage/mentor/mentor.jpeg"
                                    alt="Mohammad Rashid Damanhuri"
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Bio */}
                    <div className="lg:col-span-3">
                        <span className="mb-3 inline-block text-sm font-medium text-lp-blue-600">
                            Tentang Pengajar
                        </span>
                        <h2 className="text-2xl font-semibold text-lp-slate-900 sm:text-3xl">
                            Mohammad Rashid Damanhuri, S.I.Kom., M.M.
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-lp-slate-600">
                            Belajar bisnis ternyata lebih gampang dari
                            keliatannya, beda sama 12 tahun lalu, pas saya baru
                            mulai, akses belajar bisnis nggak segampang
                            sekarang, jadi harus belajar sendiri dan jatuh
                            bangun lebih lama
                        </p>
                        <p className="mt-3 text-base leading-relaxed text-lp-slate-600">
                            Kita bisa minimalisir kegagalan dengan perbanyak
                            persiapan, salah satunya dengan belajar, biar bisa
                            hemat waktu, dan tau langkah di setiap jalannya
                        </p>
                        <p className="mt-3 text-base leading-relaxed text-lp-slate-600">
                            Panduan ini saya buat berdasarkan pengalaman pribadi
                            dan ilmu kuliah S2 bisnis saya sebagai dasar teori.
                            Saya jelasin pakai bahasa sehari hari yang gampang
                            dipahami orang yang baru mau mulai bisnis
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lp-blue-50">
                                    <Heart className="h-6 w-6 text-lp-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-lp-slate-700">
                                        Praktis
                                    </p>
                                    <p className="text-xs text-lp-slate-400">
                                        Bukan sekadar teori
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lp-blue-50">
                                    <MessageCircle className="h-6 w-6 text-lp-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-lp-slate-700">
                                        Sederhana
                                    </p>
                                    <p className="text-xs text-lp-slate-400">
                                        Bahasa sehari-hari
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lp-blue-50">
                                    <Target className="h-6 w-6 text-lp-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-lp-slate-700">
                                        Terarah
                                    </p>
                                    <p className="text-xs text-lp-slate-400">
                                        Step-by-step jelas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Footer() {
    return (
        <footer id="footer" className="bg-lp-slate-900 py-10 sm:py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2">
                        {/* <div className="flex h-7 w-7 items-center justify-center rounded-md bg-lp-blue-600">
                            <span className="text-xs font-semibold text-white">
                                Logo
                            </span>
                        </div> */}
                        <span className="text-sm font-semibold text-lp-slate-300">
                            bangunbisnis.id
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <a
                            href="#"
                            className="text-xs text-lp-slate-400 transition-colors hover:text-lp-slate-300"
                        >
                            Kebijakan Privasi
                        </a>
                        <a
                            href="#"
                            className="text-xs text-lp-slate-400 transition-colors hover:text-lp-slate-300"
                        >
                            Syarat & Ketentuan
                        </a>
                    </div>
                </div>

                <div className="mt-6 border-t border-lp-slate-800 pt-6 text-center">
                    <p className="text-xs text-lp-slate-500">
                        © {new Date().getFullYear()} Bangun Bisnis. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

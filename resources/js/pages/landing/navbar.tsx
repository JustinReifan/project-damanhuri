import { useEffect, useState } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            id="navbar"
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'border-b border-lp-slate-200 bg-white/95 shadow-sm backdrop-blur-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <a href="/" className="flex items-center gap-2">
                    {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lp-blue-600">
                        <span className="text-sm font-semibold text-white">
                            Logo
                        </span>
                    </div> */}
                    <span className="text-lg font-semibold text-lp-blue-900">
                        bangunbisnis.id
                    </span>
                </a>
                <a
                    href="#harga"
                    id="navbar-cta"
                    className="hidden rounded-lg bg-lp-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-lp-blue-700 sm:inline-flex"
                >
                    Mulai Sekarang
                </a>
            </div>
        </nav>
    );
}

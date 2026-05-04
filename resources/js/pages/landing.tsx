import { Head } from '@inertiajs/react';

import Faq from './landing/faq';
import Footer from './landing/footer';
import Guarantee from './landing/guarantee';
import Hero from './landing/hero';
import Instructor from './landing/instructor';
import Navbar from './landing/navbar';
import Pricing from './landing/pricing';
import Problem from './landing/problem';
import Solution from './landing/solution';
import Testimonials from './landing/testimonials';
import ValueStack from './landing/value-stack';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useDwellTime } from '@/hooks/use-dwell-time';
import { useScrollTracking } from '@/hooks/use-scroll-tracking';

export default function Landing() {
    const { trackVisit, trackCTA } = useAnalytics();

    // Force light mode on mount, restore on unmount
    useEffect(() => {
        const htmlEl = document.documentElement;
        const wasDark = htmlEl.classList.contains('dark');

        htmlEl.classList.remove('dark');

        return () => {
            if (wasDark) {
                htmlEl.classList.add('dark');
            }
        };
    }, []);

    // Initialize tracking hooks
    useScrollTracking();
    useDwellTime();

    // Track page visit on mount
    useEffect(() => {
        trackVisit();
    }, [trackVisit]);

    return (
        <>
            <Head>
                <title>
                    Panduan 23 Langkah Bangun Bisnis Lokal — Mulai Bisnismu Hari
                    Ini
                </title>
                <meta
                    name="description"
                    content="Panduan langkah demi langkah untuk memulai bisnis lokal dari nol. 40+ video tutorial, 80+ template spreadsheet, dan 70+ halaman e-book. Dipercaya 7.000+ pebisnis pemula."
                />
            </Head>

            <div className="min-h-screen bg-white text-lp-slate-800">
                <Navbar />
                <Hero />
                <Problem />
                <Solution />
                <ValueStack />
                <Testimonials />
                <Instructor />
                <Pricing />
                <Guarantee />
                <Faq />
                <Footer />
            </div>
        </>
    );
}

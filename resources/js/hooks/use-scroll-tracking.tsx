import { useEffect, useRef } from 'react';
import { useAnalytics } from './use-analytics';

export function useScrollTracking() {
    const { trackScroll } = useAnalytics();
    const scrollDepths = useRef(new Set<number>());
    const lastScrollTime = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const now = Date.now();
            // Throttle scroll events to avoid spam
            if (now - lastScrollTime.current < 200) return;
            lastScrollTime.current = now;

            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY;
            const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

            // Track depth milestones
            const milestones = [25, 50, 75, 90];
            milestones.forEach((milestone) => {
                if (scrollPercent >= milestone && !scrollDepths.current.has(milestone)) {
                    scrollDepths.current.add(milestone);
                    trackScroll(milestone);
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [trackScroll]);

    return scrollDepths.current;
}

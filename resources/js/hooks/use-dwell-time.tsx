import { useCallback, useEffect, useRef } from 'react';
import { useAnalytics } from './use-analytics';

const INITIAL_THRESHOLD = 15000; // 15 seconds for "engaged" status
const HEARTBEAT_INTERVAL = 30000; // 30 seconds between heartbeats
const TICK_INTERVAL = 1000; // 1 second ticker

export function useDwellTime() {
    const { trackEngagement } = useAnalytics();

    // Tracking state refs
    const timeActive = useRef(0);
    const lastPingTime = useRef(0);
    const hasInitialTracked = useRef(false);
    const isVisible = useRef(!document.hidden);
    const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Memoized tracking function to prevent stale closures
    const sendPing = useCallback(
        (duration: number, isInitial: boolean) => {
            trackEngagement('dwell_ping', {
                duration,
                type: 'dwell_ping',
                is_initial: isInitial,
            });
        },
        [trackEngagement],
    );

    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisible.current = !document.hidden;
        };

        const tick = () => {
            // Only increment if page is visible
            if (!isVisible.current) return;

            timeActive.current += TICK_INTERVAL;

            // Check 1: Initial engagement trigger (15s threshold)
            if (!hasInitialTracked.current && timeActive.current >= INITIAL_THRESHOLD) {
                hasInitialTracked.current = true;
                lastPingTime.current = timeActive.current;
                sendPing(INITIAL_THRESHOLD, true);
                return; // Don't check heartbeat on same tick
            }

            // Check 2: Heartbeat (every 30s after initial)
            if (hasInitialTracked.current) {
                const timeSinceLastPing = timeActive.current - lastPingTime.current;
                if (timeSinceLastPing >= HEARTBEAT_INTERVAL) {
                    lastPingTime.current = timeActive.current;
                    sendPing(HEARTBEAT_INTERVAL, false);
                }
            }
        };

        // Set up visibility listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Start the ticker
        tickerRef.current = setInterval(tick, TICK_INTERVAL);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (tickerRef.current) {
                clearInterval(tickerRef.current);
                tickerRef.current = null;
            }
        };
    }, [sendPing]);

    return {
        isEngaged: hasInitialTracked.current,
        timeActive: timeActive.current,
    };
}

<?php

namespace App\Services;

use App\Models\UserAnalytic;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AbTestingService
{
    /**
     * Get Performance Matrix - The Leaderboard
     * Groups data by landing_source and calculates core metrics
     */
    public function getPerformanceMatrix(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): array
    {
        $landingSources = $this->getValidLandingSources($startDate, $endDate, $sourceFilter);

        if ($landingSources->isEmpty()) {
            return [];
        }

        $matrix = collect([]);

        foreach ($landingSources as $source) {
            $landingSource = $source->landing_source;

            // Get unique sessions for this landing source
            $visitSessions = $this->getSessionsByEventAndSource('visit', $landingSource, $startDate, $endDate, $sourceFilter);
            $engagementSessions = $this->getSessionsByEventAndSource('engagement', $landingSource, $startDate, $endDate, $sourceFilter);
            $conversionSessions = $this->getSessionsByEventAndSource('conversion', $landingSource, $startDate, $endDate, $sourceFilter);
            $paymentSessions = $this->getSessionsByEventAndSource('payment', $landingSource, $startDate, $endDate, $sourceFilter);
            $ctaClickSessions = $this->getSessionsByEventAndSource('cta_click', $landingSource, $startDate, $endDate, $sourceFilter);

            $visits = $visitSessions->count();
            $engagements = $engagementSessions->count();
            $conversions = $conversionSessions->count();
            $payments = $paymentSessions->count();
            $ctaClicks = $ctaClickSessions->count();

            // Calculate revenue from payment events
            $revenue = $this->getRevenueBySource($landingSource, $startDate, $endDate, $sourceFilter);

            // Bounce Rate: Sessions with visit but NO engagement
            $bounced = $visitSessions->diff($engagementSessions)->count();
            $bounceRate = $this->safeDivide($bounced, $visits) * 100;

            // Intent Rate: CTA Clicks / Visits
            $intentRate = $this->safeDivide($ctaClicks, $visits) * 100;

            // Lead CR: Unique conversion sessions / Unique visit sessions
            $leadCR = $this->safeDivide($conversions, $visits) * 100;

            // Strict CR: Unique payment sessions / Unique visit sessions
            $strictCR = $this->safeDivide($payments, $visits) * 100;

            // RPV: Revenue / Unique Visits
            $rpv = $this->safeDivide($revenue, $visits);

            $matrix->push([
                'landing_source' => $landingSource,
                'visits' => $visits,
                'bounce_rate' => round($bounceRate, 2),
                'intent_rate' => round($intentRate, 2),
                'lead_cr' => round($leadCR, 2),
                'strict_cr' => round($strictCR, 2),
                'rpv' => round($rpv, 2),
                'revenue' => $revenue,
                'conversions' => $conversions,
                'payments' => $payments,
                'cta_clicks' => $ctaClicks,
            ]);
        }

        // Sort by RPV descending
        return $matrix->sortByDesc('rpv')->values()->all();
    }

    /**
     * Get Split Funnel - The Journey
     * Returns step-by-step counts for each landing page
     */
    public function getSplitFunnel(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): array
    {
        $landingSources = $this->getValidLandingSources($startDate, $endDate, $sourceFilter);

        if ($landingSources->isEmpty()) {
            return [];
        }

        $funnel = collect([]);

        foreach ($landingSources as $source) {
            $landingSource = $source->landing_source;

            // 1. Visits: Total traffic
            $visitSessions = $this->getSessionsByEventAndSource('visit', $landingSource, $startDate, $endDate, $sourceFilter);
            $visits = $visitSessions->count();

            // 2. Engaged: Sessions with dwell time > 15s
            $engagedSessions = $this->getEngagedSessions($landingSource, $startDate, $endDate, $sourceFilter);
            $engaged = $engagedSessions->count();

            // 3. Intent: Sessions with cta_click
            $intentSessions = $this->getSessionsByEventAndSource('cta_click', $landingSource, $startDate, $endDate, $sourceFilter);
            $intent = $intentSessions->count();

            // 4. Leads: Sessions with conversion
            $leadSessions = $this->getSessionsByEventAndSource('conversion', $landingSource, $startDate, $endDate, $sourceFilter);
            $leads = $leadSessions->count();

            // 5. Sales: Sessions with payment
            $salesSessions = $this->getSessionsByEventAndSource('payment', $landingSource, $startDate, $endDate, $sourceFilter);
            $sales = $salesSessions->count();

            $funnel->push([
                'landing_source' => $landingSource,
                'steps' => [
                    ['stage' => 'Visits', 'count' => $visits, 'percentage' => 100],
                    ['stage' => 'Engaged', 'count' => $engaged, 'percentage' => round($this->safeDivide($engaged, $visits) * 100, 1)],
                    ['stage' => 'Intent', 'count' => $intent, 'percentage' => round($this->safeDivide($intent, $visits) * 100, 1)],
                    ['stage' => 'Leads', 'count' => $leads, 'percentage' => round($this->safeDivide($leads, $visits) * 100, 1)],
                    ['stage' => 'Sales', 'count' => $sales, 'percentage' => round($this->safeDivide($sales, $visits) * 100, 1)],
                ],
            ]);
        }

        return $funnel->values()->all();
    }

    /**
     * Get Device Performance - Compare Mobile vs Desktop
     */
    public function getDevicePerformance(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): array
    {
        $landingSources = $this->getValidLandingSources($startDate, $endDate, $sourceFilter);

        if ($landingSources->isEmpty()) {
            return [];
        }

        $performance = collect([]);

        foreach ($landingSources as $source) {
            $landingSource = $source->landing_source;

            // Get all visit sessions with their user agents
            $visitData = $this->getSessionsWithUserAgent('visit', $landingSource, $startDate, $endDate, $sourceFilter);
            $paymentSessions = $this->getSessionsByEventAndSource('payment', $landingSource, $startDate, $endDate, $sourceFilter);

            // Segment by device type
            $mobileVisits = $visitData->filter(fn ($item) => $this->isMobileDevice($item->user_agent));
            $desktopVisits = $visitData->reject(fn ($item) => $this->isMobileDevice($item->user_agent));

            // Calculate metrics for each device
            $mobileSessionIds = $mobileVisits->pluck('session_id')->unique();
            $desktopSessionIds = $desktopVisits->pluck('session_id')->unique();

            $mobilePayments = $paymentSessions->intersect($mobileSessionIds)->count();
            $desktopPayments = $paymentSessions->intersect($desktopSessionIds)->count();

            $performance->push([
                'landing_source' => $landingSource,
                'mobile' => [
                    'visits' => $mobileSessionIds->count(),
                    'payments' => $mobilePayments,
                    'conversion_rate' => round($this->safeDivide($mobilePayments, $mobileSessionIds->count()) * 100, 2),
                ],
                'desktop' => [
                    'visits' => $desktopSessionIds->count(),
                    'payments' => $desktopPayments,
                    'conversion_rate' => round($this->safeDivide($desktopPayments, $desktopSessionIds->count()) * 100, 2),
                ],
            ]);
        }

        return $performance->values()->all();
    }

    /**
     * Get CTA Performance - Button effectiveness analysis
     */
    public function getCtaPerformance(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): array
    {
        $query = UserAnalytic::where('event_type', 'cta_click')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereRaw("JSON_EXTRACT(event_data, '$.landing_source') IS NOT NULL")
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.landing_source')) != ''")
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.landing_source')) != 'unknown'");

        if ($sourceFilter && $sourceFilter !== 'all') {
            $query->where('referral_source', $sourceFilter);
        }

        // Get all CTA clicks grouped by landing source and location
        $ctaClicks = $query->select([
            DB::raw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.landing_source')) as landing_source"),
            DB::raw("COALESCE(JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.location')), 'unknown') as cta_location"),
            'session_id',
        ])->get();

        // Get all payment sessions
        $paymentSessions = UserAnalytic::where('event_type', 'payment')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->distinct()
            ->pluck('session_id');

        // Group and calculate metrics
        $ctaPerformance = $ctaClicks->groupBy('landing_source')->map(function ($sourceClicks, $landingSource) use ($paymentSessions) {
            $locations = $sourceClicks->groupBy('cta_location')->map(function ($locationClicks, $location) use ($paymentSessions) {
                $uniqueSessions = $locationClicks->pluck('session_id')->unique();
                $conversions = $uniqueSessions->intersect($paymentSessions)->count();

                return [
                    'location' => $location,
                    'click_count' => $uniqueSessions->count(),
                    'conversions' => $conversions,
                    'conversion_rate' => round($this->safeDivide($conversions, $uniqueSessions->count()) * 100, 2),
                ];
            })->sortByDesc('conversions')->values()->all();

            return [
                'landing_source' => $landingSource,
                'cta_locations' => $locations,
                'total_clicks' => $sourceClicks->pluck('session_id')->unique()->count(),
            ];
        })->values()->all();

        return $ctaPerformance;
    }

    /**
     * Get Reader Segmentation - Behavioral personas
     */
    public function getReaderSegmentation(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): array
    {
        $landingSources = $this->getValidLandingSources($startDate, $endDate, $sourceFilter);

        if ($landingSources->isEmpty()) {
            return [];
        }

        $segmentation = collect([]);

        foreach ($landingSources as $source) {
            $landingSource = $source->landing_source;

            // Get all sessions for this landing source
            $allSessions = $this->getSessionsBySource($landingSource, $startDate, $endDate, $sourceFilter);

            if ($allSessions->isEmpty()) {
                continue;
            }

            // Get scroll depths per session (max depth)
            $scrollDepths = $this->getMaxScrollDepthPerSession($allSessions, $startDate, $endDate);

            // Get dwell times per session (sum of durations in seconds)
            $dwellTimes = $this->getTotalDwellTimePerSession($allSessions, $startDate, $endDate);

            // Classify each session
            $personas = [
                'bouncers' => 0,    // Scroll < 25% AND Dwell < 15s
                'skimmers' => 0,    // Scroll > 75% AND Dwell < 60s
                'deep_readers' => 0, // Dwell > 120s
                'casuals' => 0,      // Everyone else
            ];

            foreach ($allSessions as $sessionId) {
                $scrollDepth = $scrollDepths->get($sessionId, 0);
                $dwellTime = $dwellTimes->get($sessionId, 0);

                if ($scrollDepth < 25 && $dwellTime < 15) {
                    $personas['bouncers']++;
                } elseif ($dwellTime > 120) {
                    $personas['deep_readers']++;
                } elseif ($scrollDepth > 75 && $dwellTime < 60) {
                    $personas['skimmers']++;
                } else {
                    $personas['casuals']++;
                }
            }

            $totalSessions = $allSessions->count();

            $segmentation->push([
                'landing_source' => $landingSource,
                'total_sessions' => $totalSessions,
                'personas' => [
                    [
                        'name' => 'Bouncers',
                        'description' => 'Low scroll (<25%) & low dwell (<15s)',
                        'count' => $personas['bouncers'],
                        'percentage' => round($this->safeDivide($personas['bouncers'], $totalSessions) * 100, 1),
                    ],
                    [
                        'name' => 'Skimmers',
                        'description' => 'High scroll (>75%) but quick read (<60s)',
                        'count' => $personas['skimmers'],
                        'percentage' => round($this->safeDivide($personas['skimmers'], $totalSessions) * 100, 1),
                    ],
                    [
                        'name' => 'Deep Readers',
                        'description' => 'Extended engagement (>120s)',
                        'count' => $personas['deep_readers'],
                        'percentage' => round($this->safeDivide($personas['deep_readers'], $totalSessions) * 100, 1),
                    ],
                    [
                        'name' => 'Casuals',
                        'description' => 'Moderate engagement',
                        'count' => $personas['casuals'],
                        'percentage' => round($this->safeDivide($personas['casuals'], $totalSessions) * 100, 1),
                    ],
                ],
            ]);
        }

        return $segmentation->values()->all();
    }

    /**
     * Get Scroll Heatmap - Content consumption drop-off
     */
    public function getScrollHeatmap(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): array
    {
        $landingSources = $this->getValidLandingSources($startDate, $endDate, $sourceFilter);

        if ($landingSources->isEmpty()) {
            return [];
        }

        $heatmap = collect([]);

        foreach ($landingSources as $source) {
            $landingSource = $source->landing_source;

            // Get total visits
            $visitSessions = $this->getSessionsByEventAndSource('visit', $landingSource, $startDate, $endDate, $sourceFilter);
            $totalVisits = $visitSessions->count();

            if ($totalVisits === 0) {
                continue;
            }

            // Get max scroll depth per session
            $scrollDepths = $this->getMaxScrollDepthPerSession($visitSessions, $startDate, $endDate);

            // Calculate percentage reaching each depth threshold
            $depths = [25, 50, 75, 90];
            $depthData = [];

            foreach ($depths as $threshold) {
                $sessionsReaching = $scrollDepths->filter(fn ($depth) => $depth >= $threshold)->count();
                $depthData[] = [
                    'depth' => $threshold,
                    'sessions' => $sessionsReaching,
                    'percentage' => round($this->safeDivide($sessionsReaching, $totalVisits) * 100, 1),
                ];
            }

            $heatmap->push([
                'landing_source' => $landingSource,
                'total_visits' => $totalVisits,
                'depth_analysis' => $depthData,
            ]);
        }

        return $heatmap->values()->all();
    }

    /**
     * Get Quality Analysis - Buyer vs Non-Buyer comparison
     */
    public function getQualityAnalysis(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): array
    {
        $landingSources = $this->getValidLandingSources($startDate, $endDate, $sourceFilter);

        if ($landingSources->isEmpty()) {
            return [];
        }

        $analysis = collect([]);

        foreach ($landingSources as $source) {
            $landingSource = $source->landing_source;

            // Get all sessions for this landing source
            $allSessions = $this->getSessionsBySource($landingSource, $startDate, $endDate, $sourceFilter);

            // Segment A: Buyers (sessions with payment)
            $buyerSessions = $this->getSessionsByEventAndSource('payment', $landingSource, $startDate, $endDate, $sourceFilter);

            // Segment B: Non-Buyers (sessions without payment)
            $nonBuyerSessions = $allSessions->diff($buyerSessions);

            // Calculate metrics for Buyers
            $buyerMetrics = $this->calculateQualityMetrics($buyerSessions, $startDate, $endDate);

            // Calculate metrics for Non-Buyers
            $nonBuyerMetrics = $this->calculateQualityMetrics($nonBuyerSessions, $startDate, $endDate);

            $analysis->push([
                'landing_source' => $landingSource,
                'buyers' => [
                    'count' => $buyerSessions->count(),
                    'avg_scroll_depth' => $buyerMetrics['avg_scroll_depth'],
                    'avg_dwell_time' => $buyerMetrics['avg_dwell_time'],
                ],
                'non_buyers' => [
                    'count' => $nonBuyerSessions->count(),
                    'avg_scroll_depth' => $nonBuyerMetrics['avg_scroll_depth'],
                    'avg_dwell_time' => $nonBuyerMetrics['avg_dwell_time'],
                ],
            ]);
        }

        return $analysis->values()->all();
    }

    /**
     * Get available traffic sources for filtering
     */
    public function getAvailableSources(Carbon $startDate, Carbon $endDate): array
    {
        return UserAnalytic::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('referral_source')
            ->where('referral_source', '!=', '')
            ->select('referral_source')
            ->distinct()
            ->pluck('referral_source')
            ->sort()
            ->values()
            ->all();
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Apply common filters to a query
     */
    private function applyFilters(Builder $query, ?string $landingSource, Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): Builder
    {
        $query->whereBetween('created_at', [$startDate, $endDate]);

        if ($landingSource) {
            $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.landing_source')) = ?", [$landingSource]);
        }

        if ($sourceFilter && $sourceFilter !== 'all') {
            $query->where('referral_source', $sourceFilter);
        }

        return $query;
    }

    /**
     * Get valid landing sources (exclude null, empty, 'unknown')
     */
    private function getValidLandingSources(Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): Collection
    {
        $query = UserAnalytic::select(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.landing_source')) as landing_source"))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereRaw("JSON_EXTRACT(event_data, '$.landing_source') IS NOT NULL")
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.landing_source')) != ''")
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.landing_source')) != 'unknown'");

        if ($sourceFilter && $sourceFilter !== 'all') {
            $query->where('referral_source', $sourceFilter);
        }

        return $query->groupBy('landing_source')->get();
    }

    /**
     * Get unique session IDs by event type and landing source
     */
    private function getSessionsByEventAndSource(string $eventType, string $landingSource, Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): Collection
    {
        $query = UserAnalytic::where('event_type', $eventType);
        $query = $this->applyFilters($query, $landingSource, $startDate, $endDate, $sourceFilter);

        return $query->distinct()->pluck('session_id');
    }

    /**
     * Get all unique session IDs for a landing source
     */
    private function getSessionsBySource(string $landingSource, Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): Collection
    {
        $query = UserAnalytic::query();
        $query = $this->applyFilters($query, $landingSource, $startDate, $endDate, $sourceFilter);

        return $query->distinct()->pluck('session_id');
    }

    /**
     * Get sessions with user agent for device detection
     */
    private function getSessionsWithUserAgent(string $eventType, string $landingSource, Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): Collection
    {
        $query = UserAnalytic::where('event_type', $eventType)
            ->select('session_id', 'user_agent');
        $query = $this->applyFilters($query, $landingSource, $startDate, $endDate, $sourceFilter);

        return $query->get();
    }

    /**
     * Check if user agent indicates mobile device
     */
    private function isMobileDevice(?string $userAgent): bool
    {
        if (! $userAgent) {
            return false;
        }

        $mobileIndicators = ['Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'webOS', 'BlackBerry', 'Opera Mini', 'IEMobile'];

        foreach ($mobileIndicators as $indicator) {
            if (stripos($userAgent, $indicator) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get engaged sessions (dwell time > 15s)
     */
    private function getEngagedSessions(string $landingSource, Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): Collection
    {
        $query = UserAnalytic::where('event_type', 'engagement')
            ->whereRaw("CAST(JSON_EXTRACT(event_data, '$.duration') AS UNSIGNED) > 10000");
        $query = $this->applyFilters($query, $landingSource, $startDate, $endDate, $sourceFilter);

        return $query->distinct()->pluck('session_id');
    }

    /**
     * Get total revenue from payment events for a landing source
     */
    private function getRevenueBySource(string $landingSource, Carbon $startDate, Carbon $endDate, ?string $sourceFilter = null): float
    {
        $query = UserAnalytic::where('event_type', 'payment')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.status')) = 'success'");
        $query = $this->applyFilters($query, $landingSource, $startDate, $endDate, $sourceFilter);

        $payments = $query->get();

        return $payments->sum(function ($analytic) {
            return (float) ($analytic->event_data['amount'] ?? 0);
        });
    }

    /**
     * Get max scroll depth per session
     */
    private function getMaxScrollDepthPerSession(Collection $sessionIds, Carbon $startDate, Carbon $endDate): Collection
    {
        if ($sessionIds->isEmpty()) {
            return collect([]);
        }

        return UserAnalytic::where('event_type', 'scroll')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('session_id', $sessionIds)
            ->get()
            ->groupBy('session_id')
            ->map(function ($events) {
                return $events->max(function ($event) {
                    return (float) ($event->event_data['depth'] ?? 0);
                });
            });
    }

    /**
     * Get total dwell time per session (in seconds)
     */
    private function getTotalDwellTimePerSession(Collection $sessionIds, Carbon $startDate, Carbon $endDate): Collection
    {
        if ($sessionIds->isEmpty()) {
            return collect([]);
        }

        return UserAnalytic::where('event_type', 'engagement')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('session_id', $sessionIds)
            ->get()
            ->groupBy('session_id')
            ->map(function ($events) {
                // Sum all heartbeats (ms) and convert to seconds
                $totalDurationMs = $events->sum(function ($event) {
                    return (float) ($event->event_data['duration'] ?? 0);
                });

                return $totalDurationMs / 1000;
            });
    }

    /**
     * Calculate quality metrics (scroll depth, dwell time) for a set of sessions
     */
    private function calculateQualityMetrics(Collection $sessionIds, Carbon $startDate, Carbon $endDate): array
    {
        if ($sessionIds->isEmpty()) {
            return [
                'avg_scroll_depth' => 0,
                'avg_dwell_time' => 0,
            ];
        }

        $scrollDepths = $this->getMaxScrollDepthPerSession($sessionIds, $startDate, $endDate);
        $dwellTimes = $this->getTotalDwellTimePerSession($sessionIds, $startDate, $endDate);

        $avgScrollDepth = $scrollDepths->isNotEmpty()
            ? round($scrollDepths->average(), 1)
            : 0;

        $avgDwellTime = $dwellTimes->isNotEmpty()
            ? round($dwellTimes->average(), 1)
            : 0;

        return [
            'avg_scroll_depth' => $avgScrollDepth,
            'avg_dwell_time' => $avgDwellTime,
        ];
    }

    /**
     * Safe division to prevent divide by zero errors
     */
    private function safeDivide(float $numerator, float $denominator): float
    {
        return $denominator > 0 ? $numerator / $denominator : 0;
    }
}

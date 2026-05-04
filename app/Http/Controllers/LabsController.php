<?php

namespace App\Http\Controllers;

use App\Services\AbTestingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LabsController extends Controller
{
    protected AbTestingService $abTestingService;

    public function __construct(AbTestingService $abTestingService)
    {
        $this->abTestingService = $abTestingService;
    }

    /**
     * A/B Testing Dashboard - Main endpoint
     */
    public function index(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'range' => 'nullable|in:3,5,7,14,30,custom',
            'source' => 'nullable|string',
        ]);

        // Determine date range
        $range = $request->get('range', '7');

        if ($range === 'custom') {
            $startDate = Carbon::parse($request->get('start_date', now()->subDays(7)));
            $endDate = Carbon::parse($request->get('end_date', now()))->endOfDay();
        } else {
            $days = (int) $range;
            $startDate = Carbon::now()->subDays($days)->startOfDay();
            $endDate = Carbon::now()->endOfDay();
        }

        // Get source filter
        $sourceFilter = $request->get('source');

        // Generate cache key including source filter
        $sourceKey = $sourceFilter ?? 'all';
        $cacheKey = "ab_testing_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}_{$sourceKey}";
        $cacheDuration = 15 * 60; // 15 minutes in seconds

        // Fetch data with caching
        $data = Cache::remember($cacheKey, $cacheDuration, function () use ($startDate, $endDate, $sourceFilter) {
            return [
                'matrix' => $this->abTestingService->getPerformanceMatrix($startDate, $endDate, $sourceFilter),
                'funnel' => $this->abTestingService->getSplitFunnel($startDate, $endDate, $sourceFilter),
                'quality' => $this->abTestingService->getQualityAnalysis($startDate, $endDate, $sourceFilter),
                'devices' => $this->abTestingService->getDevicePerformance($startDate, $endDate, $sourceFilter),
                'cta' => $this->abTestingService->getCtaPerformance($startDate, $endDate, $sourceFilter),
                'readers' => $this->abTestingService->getReaderSegmentation($startDate, $endDate, $sourceFilter),
                'heatmap' => $this->abTestingService->getScrollHeatmap($startDate, $endDate, $sourceFilter),
            ];
        });

        // Get available sources (not cached, lightweight query)
        $availableSources = $this->abTestingService->getAvailableSources($startDate, $endDate);

        // Return JSON for API calls
        if ($request->wantsJson()) {
            return response()->json([
                'matrix' => $data['matrix'],
                'funnel' => $data['funnel'],
                'quality' => $data['quality'],
                'devices' => $data['devices'],
                'cta' => $data['cta'],
                'readers' => $data['readers'],
                'heatmap' => $data['heatmap'],
                'available_sources' => $availableSources,
                'meta' => [
                    'start_date' => $startDate->toIso8601String(),
                    'end_date' => $endDate->toIso8601String(),
                    'range' => $range,
                    'source' => $sourceFilter,
                    'cached_at' => now()->toIso8601String(),
                ],
            ]);
        }

        // Return Inertia view for web interface
        return Inertia::render('admin/labs/index', [
            'matrix' => $data['matrix'],
            'funnel' => $data['funnel'],
            'quality' => $data['quality'],
            'devices' => $data['devices'],
            'cta' => $data['cta'],
            'readers' => $data['readers'],
            'heatmap' => $data['heatmap'],
            'availableSources' => $availableSources,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'range' => $range,
                'source' => $sourceFilter,
            ],
        ]);
    }

    /**
     * Clear cache for A/B testing data
     */
    public function clearCache(Request $request)
    {
        $range = $request->get('range', '7');
        $sourceFilter = $request->get('source');

        if ($range === 'custom') {
            $startDate = Carbon::parse($request->get('start_date', now()->subDays(7)));
            $endDate = Carbon::parse($request->get('end_date', now()))->endOfDay();
        } else {
            $days = (int) $range;
            $startDate = Carbon::now()->subDays($days)->startOfDay();
            $endDate = Carbon::now()->endOfDay();
        }

        $sourceKey = $sourceFilter ?? 'all';
        $cacheKey = "ab_testing_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}_{$sourceKey}";

        Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully',
        ]);
    }
}

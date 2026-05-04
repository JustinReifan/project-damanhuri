<?php

namespace App\Http\Controllers;

use App\Models\UserAnalytic;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Log;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $dateRange = $request->get('range', '30'); // days
        $startDate = Carbon::now()->subDays($dateRange);

        $stats = $this->getAnalyticsStats($startDate);
        $chartData = $this->getChartData($startDate);
        $referralData = $this->getReferralData($startDate);
        $conversionFunnel = $this->getConversionFunnel($startDate);

        return Inertia::render('admin/analytics', [
            'stats' => $stats,
            'chartData' => $chartData,
            'referralData' => $referralData,
            'conversionFunnel' => $conversionFunnel,
            'dateRange' => $dateRange,
        ]);
    }

    public function track(Request $request)
    {
        // Debug request
        Log::info('Analytics Request:', $request->all());

        $sessionId = $request->session()->getId();
        $ipHash = hash('sha256', $request->ip().config('app.key'));

        UserAnalytic::create([
            'session_id' => $sessionId,
            'event_type' => $request->input('event_type'),
            'event_data' => $request->input('event_data') ?? [],
            'referral_source' => $request->input('referral_source'),
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'utm_content' => $request->input('utm_content'),
            'utm_term' => $request->input('utm_term'),
            'ip_hash' => $ipHash,
            'user_agent' => $request->userAgent(),
            'user_id' => auth()->id(),
            'created_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    private function getAnalyticsStats($startDate)
    {
        $totalVisits = UserAnalytic::where('event_type', 'visit')
            ->where('created_at', '>=', $startDate)
            ->count();

        $uniqueVisitors = UserAnalytic::where('event_type', 'visit')
            ->where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count();

        $engagementRate = UserAnalytic::where('event_type', 'engagement')
            ->where('created_at', '>=', $startDate)
            ->where('event_data->type', 'dwell_time')
            ->distinct('session_id')
            ->count();

        $registrations = UserAnalytic::where('event_type', 'conversion')
            ->where('created_at', '>=', $startDate)
            ->where('event_data->type', 'registration')
            ->distinct('session_id')
            ->count();

        $paymentAnalytics = UserAnalytic::where('event_type', 'payment')
            ->where('created_at', '>=', $startDate)
            ->where('event_data->status', 'success')
            ->get();

        $payments = $paymentAnalytics->count();

        $revenue = $paymentAnalytics->sum(function ($analytic) {
            // Pastikan casting ke integer/float aman
            return (float) ($analytic->event_data['amount'] ?? 0);
        });

        return [
            'total_visits' => $totalVisits,
            'unique_visitors' => $uniqueVisitors,
            'engagement_rate' => $totalVisits > 0 ? round(($engagementRate / $totalVisits) * 100, 2) : 0,
            'conversion_rate' => $totalVisits > 0 ? round(($registrations / $totalVisits) * 100, 2) : 0,
            'conversion_to_payment_rate' => $registrations > 0 ? round(($payments / $registrations) * 100, 2) : 0,
            'payment_rate' => $registrations > 0 ? round(($payments / $totalVisits) * 100, 2) : 0,
            'total_revenue' => $revenue,
            'registrations' => $registrations,
            'payments' => $payments,
        ];
    }

    private function getChartData($startDate)
    {
        return UserAnalytic::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total'),
            'event_type'
        )
            ->where('created_at', '>=', $startDate)
            ->whereIn('event_type', ['visit', 'engagement', 'conversion', 'payment'])
            ->groupBy(['date', 'event_type'])
            ->orderBy('date')
            ->get()
            ->groupBy('event_type');
    }

    private function getReferralData($startDate)
    {
        return UserAnalytic::select('referral_source', DB::raw('COUNT(*) as count'))
            ->where('event_type', 'visit')
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('referral_source')
            ->groupBy('referral_source')
            ->orderByDesc('count')
            ->limit(10)
            ->get();
    }

    private function getConversionFunnel($startDate)
    {
        $visits = UserAnalytic::where('event_type', 'visit')
            ->where('created_at', '>=', $startDate)
            ->distinct('session_id')
            ->count();

        $engaged = UserAnalytic::where('event_type', 'engagement')
            ->where('created_at', '>=', $startDate)
            ->where('event_data->type', 'dwell_time')
            ->distinct('session_id')
            ->count();

        $registrations = UserAnalytic::where('event_type', 'conversion')
            ->where('created_at', '>=', $startDate)
            ->where('event_data->type', 'registration')
            ->distinct('session_id')
            ->count();

        $payments = UserAnalytic::where('event_type', 'payment')
            ->where('created_at', '>=', $startDate)
            ->where('event_data->status', 'success')
            ->distinct('session_id')
            ->count();

        return [
            ['stage' => 'Visits', 'count' => $visits, 'percentage' => 100],
            ['stage' => 'Engaged', 'count' => $engaged, 'percentage' => $visits > 0 ? round(($engaged / $visits) * 100, 1) : 0],
            ['stage' => 'Registered', 'count' => $registrations, 'percentage' => $visits > 0 ? round(($registrations / $visits) * 100, 1) : 0],
            ['stage' => 'Paid', 'count' => $payments, 'percentage' => $visits > 0 ? round(($payments / $visits) * 100, 1) : 0],
        ];
    }

    public function export(Request $request)
    {
        $dateRange = $request->get('range', '30');
        $startDate = Carbon::now()->subDays($dateRange);

        $data = UserAnalytic::where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="analytics-export.csv"',
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Date', 'Event Type', 'Referral Source', 'Event Data', 'User ID']);

            foreach ($data as $row) {
                fputcsv($file, [
                    $row->created_at->format('Y-m-d H:i:s'),
                    $row->event_type,
                    $row->referral_source,
                    json_encode($row->event_data),
                    $row->user_id,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

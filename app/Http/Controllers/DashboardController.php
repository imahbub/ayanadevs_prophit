<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Market;
use App\Models\MarketMovement;

class DashboardController extends Controller
{
    /**
     * Show the main dashboard with recent market movements
     */
    public function index(Request $request): Response
    {
        $threshold = $request->get('threshold', 1);
        
        // Get recent significant movements
        $movements = MarketMovement::with('market')
            ->significant($threshold)
            ->recent(24)
            ->orderBy('movement_detected_at', 'desc')
            ->limit(20)
            ->get();

        // Get some basic stats
        $stats = [
            'total_movements_today' => MarketMovement::recent(24)->count(),
            'significant_movements_today' => MarketMovement::recent(24)->significant($threshold)->count(),
            'active_markets' => Market::active()->count(),
            'last_sync' => Market::latest('updated_at')->first()?->updated_at,
            'recent_markets' => Market::where('active', true)
                ->where('current_probability', '>', 0.01)
                ->where('current_probability', '<', 0.99)
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function($market) {
                    return [
                        'id' => $market->id,
                        'question' => $market->question,
                        'current_probability' => $market->current_probability,
                        'volume' => $market->volume,
                        'category' => $market->category,
                        'updated_at' => $market->updated_at->toISOString(),
                    ];
                })
                ->toArray(),
        ];

        return Inertia::render('Dashboard', [
            'movements' => $movements,
            'stats' => $stats,
            'threshold' => $threshold,
        ]);
    }

    /**
     * Show individual market details
     */
    public function show(Market $market, Request $request): Response
    {
        $hours = $request->get('hours', 24);

        // Load market with its movements and price history
        $market->load(['movements' => function ($query) use ($hours) {
            $query->recent($hours)->orderBy('movement_detected_at', 'desc');
        }]);

        // Get price history for the chart
        $priceHistory = $market->priceHistory()
            ->recent($hours)
            ->orderBy('recorded_at')
            ->get()
            ->map(function ($history) {
                return [
                    'x' => $history->recorded_at->toISOString(),
                    'y' => (float) $history->probability,
                ];
            });

        return Inertia::render('MarketDetail', [
            'market' => $market,
            'priceHistory' => $priceHistory,
            'hours' => $hours,
        ]);
    }

    /**
     * Show historic movements page
     */
    public function historic(Request $request): Response
    {
        $timeframe = $request->get('timeframe', '30'); // Default to 30 days
        $minThreshold = $request->get('min_threshold', 1);
        
        // Get all movements within timeframe
        $movements = MarketMovement::with('market')
            ->where('movement_detected_at', '>=', now()->subDays($timeframe))
            ->where('change_percentage', '>=', $minThreshold)
            ->orderBy('movement_detected_at', 'desc')
            ->paginate(50);

        // Get movement statistics
        $stats = [
            'total_movements' => MarketMovement::where('movement_detected_at', '>=', now()->subDays($timeframe))->count(),
            'largest_movement' => MarketMovement::where('movement_detected_at', '>=', now()->subDays($timeframe))
                ->orderBy('change_percentage', 'desc')
                ->first(),
            'most_volatile_market' => Market::withCount(['movements' => function ($query) use ($timeframe) {
                $query->where('movement_detected_at', '>=', now()->subDays($timeframe));
            }])
            ->orderBy('movements_count', 'desc')
            ->first(),
            'average_movement_size' => MarketMovement::where('movement_detected_at', '>=', now()->subDays($timeframe))
                ->avg('change_percentage'),
        ];

        return Inertia::render('HistoricMovements', [
            'movements' => $movements,
            'stats' => $stats,
            'timeframe' => $timeframe,
            'minThreshold' => $minThreshold,
        ]);
    }
}

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
        $threshold = $request->get('threshold', 10);
        
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
}

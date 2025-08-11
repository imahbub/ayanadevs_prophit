<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Market;
use App\Models\MarketMovement;
use App\Models\MarketPriceHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MarketController extends Controller
{
    /**
     * Get markets with recent significant movements
     */
    public function recentMovements(Request $request): JsonResponse
    {
        $threshold = $request->get('threshold', 10);
        $hours = $request->get('hours', 24);

        $movements = MarketMovement::with('market')
            ->significant($threshold)
            ->recent($hours)
            ->orderBy('movement_detected_at', 'desc')
            ->paginate(20);

        return response()->json($movements);
    }

    /**
     * Get specific market details with price history
     */
    public function show(Market $market, Request $request): JsonResponse
    {
        $hours = $request->get('hours', 24);

        $market->load(['movements' => function ($query) use ($hours) {
            $query->recent($hours)->orderBy('movement_detected_at', 'desc');
        }]);

        // Get price history for chart
        $priceHistory = MarketPriceHistory::where('market_id', $market->id)
            ->recent($hours)
            ->orderBy('recorded_at')
            ->get();

        return response()->json([
            'market' => $market,
            'price_history' => $priceHistory,
        ]);
    }

    /**
     * Get price history data for a specific market
     */
    public function priceHistory(Market $market, Request $request): JsonResponse
    {
        $hours = $request->get('hours', 24);
        $granularity = $request->get('granularity', 'hour'); // hour, minute

        $query = MarketPriceHistory::where('market_id', $market->id)
            ->recent($hours)
            ->orderBy('recorded_at');

        // Apply granularity by grouping if needed
        if ($granularity === 'hour') {
            $priceHistory = $query->get()->groupBy(function ($item) {
                return $item->recorded_at->format('Y-m-d H:00:00');
            })->map(function ($group) {
                // Take the last price of each hour
                return $group->last();
            })->values();
        } else {
            $priceHistory = $query->get();
        }

        return response()->json($priceHistory);
    }

    /**
     * Get market statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_markets' => Market::active()->count(),
            'total_movements_today' => MarketMovement::recent(24)->count(),
            'significant_movements_today' => MarketMovement::recent(24)->significant(10)->count(),
            'average_movement_size' => MarketMovement::recent(24)->avg('change_percentage'),
        ];

        return response()->json($stats);
    }

    /**
     * Search markets by question
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q');
        
        if (!$query) {
            return response()->json([]);
        }

        $markets = Market::active()
            ->where('question', 'LIKE', "%{$query}%")
            ->orderBy('volume', 'desc')
            ->limit(10)
            ->get();

        return response()->json($markets);
    }

    /**
     * Trigger manual sync of Polymarket data
     */
    public function triggerSync(Request $request)
    {
        try {
            // Run the sync command
            $exitCode = \Artisan::call('polymarket:sync');
            
            if ($exitCode === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Sync completed successfully',
                    'timestamp' => now()->toISOString()
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Sync failed with exit code: ' . $exitCode
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage()
            ], 500);
        }
    }
}

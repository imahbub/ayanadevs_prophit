<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Market;
use App\Models\MarketPriceHistory;
use App\Models\MarketMovement;
use Carbon\Carbon;

class PolymarketService
{
    private string $baseUrl = 'https://clob.polymarket.com';
    private string $apiKey;
    private string $secret;
    private string $passphrase;
    private string $privateKey;

    public function __construct()
    {
        $this->apiKey = config('services.polymarket.api_key');
        $this->secret = config('services.polymarket.secret');
        $this->passphrase = config('services.polymarket.passphrase');
        $this->privateKey = config('services.polymarket.private_key');
    }

    /**
     * Fetch active markets from Polymarket
     */
    public function fetchActiveMarkets(): array
    {
        try {
            $response = Http::timeout(30)->withHeaders([
                'POLY-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/markets', [
                'limit' => 1000,
                'active' => 'true',
                'next_cursor' => '', // Get latest markets
                'order' => 'volume_24hr' // Order by recent trading activity
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // The API returns an object with 'data' key containing the markets array
                if (isset($data['data']) && is_array($data['data'])) {
                    return $data['data'];
                }
                
                // Fallback for different response format
                if (is_array($data)) {
                    return $data;
                }
                
                Log::warning('Unexpected API response format', ['response' => $data]);
                return [];
            }

            Log::error('Failed to fetch markets from Polymarket', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception fetching markets from Polymarket', [
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Fetch market price data
     */
    public function fetchMarketPrices(string $marketId): array
    {
        try {
            $response = Http::withHeaders([
                'POLY-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . "/markets/{$marketId}/prices");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to fetch market prices from Polymarket', [
                'market_id' => $marketId,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception fetching market prices from Polymarket', [
                'market_id' => $marketId,
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Update or create market from Polymarket data
     */
    public function updateMarketFromData(array $marketData): ?Market
    {
        try {
            // Extract market ID - Polymarket uses condition_id
            $marketId = $marketData['condition_id'] ?? null;
            
            if (!$marketId || empty($marketId)) {
                Log::info('Skipping market without condition_id', [
                    'question' => $marketData['question'] ?? 'unknown',
                    'active' => $marketData['active'] ?? false
                ]);
                return null;
            }

            $active = $marketData['active'] ?? false;
            $archived = $marketData['archived'] ?? false;
            $closed = $marketData['closed'] ?? false;
            
            // Priority filtering: prefer markets with trading activity
            $acceptingOrders = $marketData['accepting_orders'] ?? false;
            $hasVolume = ($marketData['volume'] ?? 0) > 0;
            
            // Skip completely inactive or archived markets
            if (!$active || $archived) {
                Log::info('Skipping inactive/archived market', [
                    'question' => substr($marketData['question'] ?? 'Unknown', 0, 50),
                    'active' => $active,
                    'archived' => $archived
                ]);
                return null;
            }
            
            // For markets that are closed but still have activity, log for future optimization
            if ($closed) {
                Log::info('Processing closed market with activity', [
                    'question' => substr($marketData['question'] ?? 'Unknown', 0, 50),
                    'accepting_orders' => $acceptingOrders,
                    'has_volume' => $hasVolume
                ]);
            }

            // Parse the market question
            $question = $marketData['question'] ?? 'Unknown Market';
            
            // Get current probability from tokens
            $currentProbability = $this->extractProbability($marketData);
            
            if ($currentProbability === null) {
                Log::info('Could not extract probability from market data', [
                    'condition_id' => $marketId,
                    'question' => $question
                ]);
                return null;
            }

            // Extract volume if available (not always present in the API)
            $volume = $marketData['volume'] ?? null;
            
            // Extract category from tags
            $category = null;
            if (isset($marketData['tags']) && is_array($marketData['tags'])) {
                $tags = array_filter($marketData['tags'], fn($tag) => $tag !== 'All');
                $category = !empty($tags) ? $tags[0] : null;
            }
            
            // Extract end date
            $endDate = null;
            if (isset($marketData['end_date_iso'])) {
                try {
                    $endDate = Carbon::parse($marketData['end_date_iso']);
                } catch (\Exception $e) {
                    Log::warning('Could not parse end_date_iso', [
                        'end_date_iso' => $marketData['end_date_iso'],
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $market = Market::updateOrCreate(
                ['polymarket_id' => $marketId],
                [
                    'question' => $question,
                    'current_probability' => $currentProbability,
                    'volume' => $volume,
                    'category' => $category,
                    'end_date' => $endDate,
                    'active' => $marketData['active'] ?? false,
                    'metadata' => $marketData,
                ]
            );
            
            // Always update the timestamp to reflect sync time
            $market->touch();

            // Record price history
            MarketPriceHistory::create([
                'market_id' => $market->id,
                'probability' => $currentProbability,
                'volume' => $volume,
                'recorded_at' => now(),
            ]);

            return $market;

        } catch (\Exception $e) {
            Log::error('Error updating market from Polymarket data', [
                'error' => $e->getMessage(),
                'condition_id' => $marketData['condition_id'] ?? 'unknown',
                'question' => $marketData['question'] ?? 'unknown'
            ]);
            return null;
        }
    }

    /**
     * Extract probability from Polymarket data format
     */
    private function extractProbability(array $marketData): ?float
    {
        // Extract from tokens array - Polymarket format
        if (isset($marketData['tokens']) && is_array($marketData['tokens'])) {
            // Find the "Yes" token or first token if binary market
            foreach ($marketData['tokens'] as $token) {
                if (isset($token['outcome']) && isset($token['price'])) {
                    // Prefer "Yes" outcome, otherwise use first token
                    if (strtolower($token['outcome']) === 'yes' || count($marketData['tokens']) === 2) {
                        $price = (float) $token['price'];
                        // Ensure price is between 0 and 1
                        return max(0, min(1, $price));
                    }
                }
            }
            
            // Fallback to first token with price
            if (!empty($marketData['tokens']) && isset($marketData['tokens'][0]['price'])) {
                $price = (float) $marketData['tokens'][0]['price'];
                return max(0, min(1, $price));
            }
        }

        // Legacy format support
        if (isset($marketData['outcome_prices']) && is_array($marketData['outcome_prices'])) {
            $price = $marketData['outcome_prices'][0] ?? null;
            return $price ? max(0, min(1, (float) $price)) : null;
        }

        if (isset($marketData['price'])) {
            return max(0, min(1, (float) $marketData['price']));
        }

        if (isset($marketData['last_trade_price'])) {
            return max(0, min(1, (float) $marketData['last_trade_price']));
        }

        return null;
    }

    /**
     * Detect significant market movements
     */
    public function detectSignificantMovements(Market $market, float $threshold = 1.0): void
    {
        // Get price history from last 24 hours
        $recentHistory = $market->priceHistory()
            ->where('recorded_at', '>=', now()->subDay())
            ->orderBy('recorded_at')
            ->get();

        if ($recentHistory->count() < 2) {
            return; // Need at least 2 data points
        }

        $currentPrice = $recentHistory->last();
        $previousPrice = $recentHistory->skip($recentHistory->count() - 2)->first();

        // Calculate percentage change (avoid division by zero)
        if ($previousPrice->probability == 0) {
            return; // Can't calculate meaningful percentage change from zero
        }
        
        $changePercentage = (($currentPrice->probability - $previousPrice->probability) / $previousPrice->probability) * 100;

        // Check if movement is significant
        if (abs($changePercentage) >= $threshold) {
            // Check if we already recorded this movement recently
            $existingMovement = MarketMovement::where('market_id', $market->id)
                ->where('movement_detected_at', '>=', now()->subHour())
                ->first();

            if (!$existingMovement) {
                MarketMovement::create([
                    'market_id' => $market->id,
                    'probability_before' => $previousPrice->probability,
                    'probability_after' => $currentPrice->probability,
                    'change_percentage' => $changePercentage,
                    'movement_started_at' => $previousPrice->recorded_at,
                    'movement_detected_at' => now(),
                    'volume_during_movement' => $currentPrice->volume,
                    'additional_data' => [
                        'threshold_used' => $threshold,
                        'detection_method' => 'consecutive_price_comparison'
                    ],
                ]);

                Log::info('Significant market movement detected', [
                    'market_id' => $market->id,
                    'question' => $market->question,
                    'change_percentage' => $changePercentage,
                    'probability_before' => $previousPrice->probability,
                    'probability_after' => $currentPrice->probability,
                ]);
            }
        }
    }

    /**
     * Sync all active markets
     */
    public function syncMarkets(): void
    {
        Log::info('Starting Polymarket sync');

        $markets = $this->fetchActiveMarkets();
        
        if (empty($markets)) {
            Log::warning('No markets fetched from Polymarket');
            return;
        }

        // Debug the API response format
        Log::info('Polymarket API response sample', [
            'markets_type' => gettype($markets),
            'markets_count' => is_array($markets) ? count($markets) : 'not_array',
            'first_market_sample' => is_array($markets) && !empty($markets) ? 
                (is_array($markets[0]) ? array_keys($markets[0]) : gettype($markets[0])) : 'no_data'
        ]);

        $processed = 0;
        $errors = 0;

        foreach ($markets as $marketData) {
            // Skip if not an array
            if (!is_array($marketData)) {
                Log::warning('Skipping non-array market data', ['type' => gettype($marketData), 'data' => $marketData]);
                $errors++;
                continue;
            }

            $market = $this->updateMarketFromData($marketData);
            
            if ($market) {
                $this->detectSignificantMovements($market);
                $processed++;
            } else {
                $errors++;
            }
        }

        Log::info('Polymarket sync completed', [
            'processed' => $processed,
            'errors' => $errors,
            'total' => count($markets)
        ]);
    }
}

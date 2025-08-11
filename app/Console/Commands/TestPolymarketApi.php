<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestPolymarketApi extends Command
{
    protected $signature = 'polymarket:test';
    protected $description = 'Test Polymarket API connection and response format';

    public function handle()
    {
        $this->info('Testing Polymarket API endpoints...');

        $apiKey = config('services.polymarket.api_key');
        $baseUrl = 'https://clob.polymarket.com';
        $gammaBaseUrl = 'https://gamma-api.polymarket.com';

        // Test different endpoints and parameters to find active markets
        $endpoints = [
            // Basic markets endpoint
            $baseUrl . '/markets',
            $baseUrl . '/markets?limit=10',
            
            // Try different filters for active markets
            $baseUrl . '/markets?active=true',
            $baseUrl . '/markets?active=true&limit=10',
            $baseUrl . '/markets?accepting_orders=true',
            $baseUrl . '/markets?accepting_orders=true&limit=10',
            $baseUrl . '/markets?closed=false',
            $baseUrl . '/markets?closed=false&limit=10',
            $baseUrl . '/markets?archived=false',
            $baseUrl . '/markets?archived=false&limit=10',
            
            // Combine filters
            $baseUrl . '/markets?active=true&closed=false',
            $baseUrl . '/markets?active=true&closed=false&limit=10',
            $baseUrl . '/markets?active=true&accepting_orders=true',
            $baseUrl . '/markets?active=true&accepting_orders=true&limit=10',
            
            // Try different ordering
            $baseUrl . '/markets?order=volume_24hr&limit=10',
            $baseUrl . '/markets?order=created_at&limit=10',
            $baseUrl . '/markets?order=end_date&limit=10',
            
            // Try different time filters
            $baseUrl . '/markets?end_date_after=' . now()->format('Y-m-d'),
            $baseUrl . '/markets?end_date_after=' . now()->addDays(30)->format('Y-m-d'),
            
            // Other potential endpoints
            $baseUrl . '/active-markets',
            $baseUrl . '/trading-markets',
            $baseUrl . '/live-markets',
            $baseUrl . '/markets/live',
            $baseUrl . '/markets/active',
            $baseUrl . '/markets/trading',
            
            // Try different base URLs
            'https://polymarket.com/api/markets',
            'https://api.polymarket.com/markets',
            'https://clob.polymarket.com/v1/markets',
            'https://clob.polymarket.com/api/markets',
            
            // Test Gamma API endpoints
            $gammaBaseUrl . '/markets',
            $gammaBaseUrl . '/markets?limit=10',
            $gammaBaseUrl . '/markets?active=true',
            $gammaBaseUrl . '/markets?active=true&limit=10',
            $gammaBaseUrl . '/markets?closed=false',
            $gammaBaseUrl . '/markets?closed=false&limit=10',
            $gammaBaseUrl . '/markets?accepting_orders=true',
            $gammaBaseUrl . '/markets?accepting_orders=true&limit=10',
            $gammaBaseUrl . '/active-markets',
            $gammaBaseUrl . '/trading-markets',
            $gammaBaseUrl . '/live-markets',
            $gammaBaseUrl . '/markets/live',
            $gammaBaseUrl . '/markets/active',
            $gammaBaseUrl . '/markets/trading',
            $gammaBaseUrl . '/v1/markets',
            $gammaBaseUrl . '/api/markets',
            $gammaBaseUrl . '/events',
            $gammaBaseUrl . '/conditions',
            $gammaBaseUrl . '/questions',
        ];

        foreach ($endpoints as $endpoint) {
            $this->info("\n" . str_repeat('=', 60));
            $this->info("Testing endpoint: {$endpoint}");
            $this->info(str_repeat('=', 60));
            
            try {
                $response = Http::timeout(15)->withHeaders([
                    'POLY-API-KEY' => $apiKey,
                    'Content-Type' => 'application/json',
                ])->get($endpoint);

                $this->info("Status: {$response->status()}");
                
                if ($response->successful()) {
                    $data = $response->json();
                    $this->info("Response type: " . gettype($data));
                    
                    if (is_array($data)) {
                        $this->info("Array length: " . count($data));
                        
                        if (isset($data['data']) && is_array($data['data'])) {
                            $this->info("Data array length: " . count($data['data']));
                            $this->analyzeMarkets($data['data'], $endpoint);
                        } else {
                            $this->analyzeMarkets($data, $endpoint);
                        }
                    } else {
                        $this->line("Response is not an array: " . gettype($data));
                        $this->line("Response preview: " . substr(json_encode($data), 0, 200) . "...");
                    }
                } else {
                    $this->error("Error response:");
                    $this->line($response->body());
                }
                
            } catch (\Exception $e) {
                $this->error("Exception for {$endpoint}: " . $e->getMessage());
            }
        }

        // Test without API key for public endpoints
        $this->info("\n" . str_repeat('=', 60));
        $this->info("Testing public endpoints without API key...");
        $this->info(str_repeat('=', 60));
        
        $publicEndpoints = [
            'https://clob.polymarket.com/markets?limit=5',
            'https://polymarket.com/api/markets?limit=5',
            'https://api.polymarket.com/markets?limit=5',
            'https://gamma-api.polymarket.com/markets?limit=5',
            'https://gamma-api.polymarket.com/active-markets?limit=5',
            'https://gamma-api.polymarket.com/trading-markets?limit=5',
        ];

        foreach ($publicEndpoints as $endpoint) {
            $this->info("\nTesting public endpoint: {$endpoint}");
            try {
                $response = Http::timeout(10)->get($endpoint);
                $this->info("Status: {$response->status()}");
                if ($response->successful()) {
                    $data = $response->json();
                    $this->info("Success - Response type: " . gettype($data));
                    if (is_array($data) && !empty($data)) {
                        $this->analyzeMarkets($data, $endpoint);
                    }
                }
            } catch (\Exception $e) {
                $this->error("Exception: " . $e->getMessage());
            }
        }
    }

    private function analyzeMarkets($markets, $endpoint)
    {
        if (empty($markets)) {
            $this->warn("No markets found in response");
            return;
        }

        $this->info("Analyzing " . count($markets) . " markets from {$endpoint}");

        $activeCount = 0;
        $acceptingOrdersCount = 0;
        $closedCount = 0;
        $archivedCount = 0;
        $dynamicPricesCount = 0;
        $futureEndDatesCount = 0;

        foreach ($markets as $market) {
            if (!is_array($market)) continue;

            $active = $market['active'] ?? false;
            $acceptingOrders = $market['accepting_orders'] ?? false;
            $closed = $market['closed'] ?? false;
            $archived = $market['archived'] ?? false;

            if ($active) $activeCount++;
            if ($acceptingOrders) $acceptingOrdersCount++;
            if ($closed) $closedCount++;
            if ($archived) $archivedCount++;

            // Check for dynamic prices
            if (isset($market['tokens']) && is_array($market['tokens'])) {
                foreach ($market['tokens'] as $token) {
                    if (isset($token['price'])) {
                        $price = (float) $token['price'];
                        if ($price > 0.01 && $price < 0.99) {
                            $dynamicPricesCount++;
                            break;
                        }
                    }
                }
            }

            // Check for future end dates
            if (isset($market['end_date_iso'])) {
                try {
                    $endDate = \Carbon\Carbon::parse($market['end_date_iso']);
                    if ($endDate->isFuture()) {
                        $futureEndDatesCount++;
                    }
                } catch (\Exception $e) {
                    // Ignore parsing errors
                }
            }
        }

        $this->info("Market Analysis:");
        $this->info("- Active: {$activeCount}");
        $this->info("- Accepting Orders: {$acceptingOrdersCount}");
        $this->info("- Closed: {$closedCount}");
        $this->info("- Archived: {$archivedCount}");
        $this->info("- Dynamic Prices: {$dynamicPricesCount}");
        $this->info("- Future End Dates: {$futureEndDatesCount}");

        // Show sample of markets with dynamic prices
        if ($dynamicPricesCount > 0) {
            $this->info("\nSample markets with dynamic prices:");
            $count = 0;
            foreach ($markets as $market) {
                if (!is_array($market) || $count >= 3) break;
                
                if (isset($market['tokens']) && is_array($market['tokens'])) {
                    foreach ($market['tokens'] as $token) {
                        if (isset($token['price'])) {
                            $price = (float) $token['price'];
                            if ($price > 0.01 && $price < 0.99) {
                                $this->info("- " . substr($market['question'] ?? 'Unknown', 0, 50) . " | Price: {$price}");
                                $count++;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

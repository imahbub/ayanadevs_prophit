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
        $this->info('Testing Polymarket API...');

        $apiKey = config('services.polymarket.api_key');
        $baseUrl = 'https://clob.polymarket.com';

        // Test different endpoints to understand the API structure
        $endpoints = [
            '/markets',
            '/markets?limit=5',
            '/book',
            '/events',
        ];

        foreach ($endpoints as $endpoint) {
            $this->info("Testing endpoint: {$endpoint}");
            
            try {
                $response = Http::timeout(10)->withHeaders([
                    'POLY-API-KEY' => $apiKey,
                    'Content-Type' => 'application/json',
                ])->get($baseUrl . $endpoint);

                $this->info("Status: {$response->status()}");
                
                if ($response->successful()) {
                    $data = $response->json();
                    $this->info("Response type: " . gettype($data));
                    
                    if (is_array($data)) {
                        $this->info("Array length: " . count($data));
                        $this->info("Array keys: " . implode(', ', array_keys($data)));
                        $this->info("Is list: " . (array_is_list($data) ? 'yes' : 'no'));
                        
                        if (!empty($data)) {
                            // Get first value regardless of key
                            $firstKey = array_key_first($data);
                            $firstValue = $data[$firstKey];
                            
                            $this->info("First key: " . $firstKey);
                            $this->info("First value type: " . gettype($firstValue));
                            
                            if (is_array($firstValue)) {
                                $this->info("First value keys: " . implode(', ', array_keys($firstValue)));
                            }
                            
                            $this->line("Full response:");
                            $this->line(json_encode($data, JSON_PRETTY_PRINT));
                        }
                    } else {
                        $this->line("Full response:");
                        $this->line(json_encode($data, JSON_PRETTY_PRINT));
                    }
                } else {
                    $this->error("Error response:");
                    $this->line($response->body());
                }
                
                $this->line('---');
                
            } catch (\Exception $e) {
                $this->error("Exception for {$endpoint}: " . $e->getMessage());
            }
        }

        // Also test without API key to see if that works
        $this->info('Testing without API key...');
        try {
            $response = Http::timeout(10)->get($baseUrl . '/markets?limit=3');
            $this->info("Status without API key: {$response->status()}");
            if ($response->successful()) {
                $data = $response->json();
                $this->info("Success without API key - Response type: " . gettype($data));
                if (is_array($data) && !empty($data)) {
                    $this->line(json_encode($data[0], JSON_PRETTY_PRINT));
                }
            }
        } catch (\Exception $e) {
            $this->error("Exception without API key: " . $e->getMessage());
        }
    }
}

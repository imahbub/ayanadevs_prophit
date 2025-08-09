<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PolymarketService;

class SyncPolymarketData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'polymarket:sync {--threshold=10 : Minimum percentage change to detect as significant movement}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync market data from Polymarket and detect significant movements';

    /**
     * Execute the console command.
     */
    public function handle(PolymarketService $polymarketService)
    {
        $this->info('Starting Polymarket data sync...');
        
        try {
            $polymarketService->syncMarkets();
            $this->info('Polymarket data sync completed successfully!');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error during Polymarket sync: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

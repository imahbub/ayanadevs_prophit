<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MarketController;

Route::middleware(['throttle:api'])->group(function () {
    // Market movements API
    Route::get('/movements', [MarketController::class, 'recentMovements']);
    Route::get('/markets/{market}', [MarketController::class, 'show']);
    Route::get('/markets/{market}/price-history', [MarketController::class, 'priceHistory']);
    Route::get('/markets/search', [MarketController::class, 'search']);
    Route::get('/stats', [MarketController::class, 'stats']);
});

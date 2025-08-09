<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/historic', [DashboardController::class, 'historic'])->name('historic');
Route::get('/test', function () {
    return view('test');
})->name('test');
Route::get('/market/{market}', [DashboardController::class, 'show'])->name('market.show');

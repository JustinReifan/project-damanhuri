<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\LabsController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landing')->name('home');

// Public analytics tracking (must be outside auth middleware)
Route::post('/analytics/track', [AnalyticsController::class, 'track'])->name('analytics.track');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        // Analytics routes
        Route::get('/', [AnalyticsController::class, 'index'])->name('dashboard');
        Route::get('/export', [AnalyticsController::class, 'export'])->name('analytics.export');

        // A/B Testing Labs routes
        Route::get('/labs', [LabsController::class, 'index'])->name('labs');
        Route::post('/labs/clear-cache', [LabsController::class, 'clearCache'])->name('labs.clear-cache');
    });
});

require __DIR__.'/settings.php';

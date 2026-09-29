<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BundleController;
use App\Http\Controllers\SettingsController;

/*
|--------------------------------------------------------------------------
| FIT ERA API Routes
|--------------------------------------------------------------------------
|
| These routes handle all storefront requests and admin management.
| They match the exact JSON payloads used by resources/js/lib/api.js.
|
*/

// Public Storefront Endpoints
Route::prefix('orders')->group(function () {
    Route::post('/', [OrderController::class, 'store']); // Place order (Guest or Customer)
    Route::get('{number}', [OrderController::class, 'track']); // Track order
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/bundles', [BundleController::class, 'index']);

Route::post('/discounts/validate', [DiscountController::class, 'validateCode']);
Route::get('/settings', [SettingsController::class, 'show']);

// Authentication Endpoints
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

// Admin Management Endpoints (Can be protected with auth:sanctum or custom admin middleware)
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{number}/status', [OrderController::class, 'updateStatus']);

    // Catalog Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Bundles
    Route::post('/bundles', [BundleController::class, 'store']);
    Route::put('/bundles/{id}', [BundleController::class, 'update']);
    Route::delete('/bundles/{id}', [BundleController::class, 'destroy']);

    // Discounts
    Route::get('/discounts', [DiscountController::class, 'index']);
    Route::post('/discounts', [DiscountController::class, 'store']);
    Route::delete('/discounts/{code}', [DiscountController::class, 'destroy']);

    // Settings
    Route::post('/settings', [SettingsController::class, 'update']);
});

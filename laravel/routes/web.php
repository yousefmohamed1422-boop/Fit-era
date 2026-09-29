<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Bundle;
use App\Models\Order;

/*
|--------------------------------------------------------------------------
| FIT ERA Web Routes (Inertia.js Integration)
|--------------------------------------------------------------------------
|
| If running with Laravel + Inertia.js:
| Each route maps directly to a page in resources/js/Pages or resources/js/admin.
|
*/

// Storefront routes
Route::get('/', function () {
    return Inertia::render('Home', [
        'products' => Product::all(),
    ]);
})->name('home');

Route::get('/shop/{category?}', function ($category = 'all') {
    return Inertia::render('Shop', [
        'category' => $category,
        'products' => Product::all(),
    ]);
})->name('shop');

Route::get('/product/{slug}', function ($slug) {
    $product = Product::where('slug', $slug)->firstOrFail();
    $related = Product::where('category', $product->category)
        ->where('id', '!=', $product->id)
        ->take(4)
        ->get();

    return Inertia::render('Product', [
        'product' => $product,
        'related' => $related,
    ]);
})->name('product.show');

Route::get('/checkout', function () {
    return Inertia::render('Checkout');
})->name('checkout');

Route::get('/order/{number}', function ($number) {
    return Inertia::render('Order', [
        'number' => $number,
    ]);
})->name('order.show');

Route::get('/track/{number?}', function ($number = '') {
    return Inertia::render('Track', [
        'number' => $number,
    ]);
})->name('track');

// Admin Portal Routes
Route::prefix('admin')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('admin/Login');
    })->name('admin.login');

    Route::middleware(['auth'])->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/Overview');
        })->name('admin.overview');

        Route::get('/products/{id?}', function ($id = null) {
            return Inertia::render('admin/Products', ['id' => $id]);
        })->name('admin.products');

        Route::get('/categories', function () {
            return Inertia::render('admin/Categories');
        })->name('admin.categories');

        Route::get('/bundles', function () {
            return Inertia::render('admin/Bundles');
        })->name('admin.bundles');

        Route::get('/orders', function () {
            return Inertia::render('admin/Orders');
        })->name('admin.orders');

        Route::get('/discounts', function () {
            return Inertia::render('admin/Discounts');
        })->name('admin.discounts');

        Route::get('/settings', function () {
            return Inertia::render('admin/Settings');
        })->name('admin.settings');
    });
});

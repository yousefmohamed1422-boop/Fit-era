<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for FIT ERA store.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'basics', 'hoodies', 'pants', 'tanks'
            $table->string('name');
            $table->text('blurb')->nullable();
            $table->string('color')->default('black');
            $table->timestamps();
        });

        // 2. Products
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'tee', 'baby', 'hoodie'
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('category');
            $table->decimal('price', 10, 2);
            $table->decimal('was', 10, 2)->nullable();
            $table->string('shape')->default('tee');
            $table->json('colors')->nullable(); // array of color IDs, e.g. ["black", "sand", "white"]
            $table->json('sizes')->nullable();  // array of sizes, e.g. ["S", "M", "L", "XL"]
            $table->string('badge')->nullable(); // e.g. "Best Seller", "New"
            $table->decimal('rating', 3, 2)->default(5.0);
            $table->unsignedInteger('reviews')->default(0);
            $table->text('desc')->nullable();
            $table->string('fabric')->nullable();
            $table->string('fit')->nullable();
            $table->text('model_info')->nullable();
            $table->string('image')->nullable();
            $table->json('images')->nullable();
            $table->json('color_images')->nullable();
            $table->timestamps();

            $table->foreign('category')->references('id')->on('categories')->onDelete('cascade');
        });

        // 3. Bundles
        Schema::create('bundles', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('badge')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('was', 10, 2)->nullable();
            $table->text('desc')->nullable();
            $table->json('includes')->nullable();
            $table->json('items')->nullable();
            $table->timestamps();
        });

        // 4. Discount Codes
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->unsignedInteger('percentage'); // e.g. 15 for 15%
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // 5. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique(); // e.g. 'FE-1042'
            $table->string('customer_name');
            $table->string('customer_whatsapp');
            $table->string('customer_email')->nullable();
            $table->string('shipping_city');
            $table->text('shipping_address');
            $table->text('shipping_notes')->nullable();
            $table->string('payment_method')->default('cod'); // 'cod' or 'instapay'
            $table->string('discount_code')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->unsignedTinyInteger('step')->default(0); // 0=Received, 1=Confirmed, 2=Packed, 3=Out for delivery, 4=Delivered
            $table->boolean('demo')->default(false);
            $table->timestamps();
        });

        // 6. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('product_id')->nullable();
            $table->string('name');
            $table->string('color_name')->nullable();
            $table->string('size')->nullable();
            $table->unsignedInteger('qty')->default(1);
            $table->decimal('price', 10, 2);
            $table->string('hex')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // 7. Store Settings
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('discount_codes');
        Schema::dropIfExists('bundles');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('store_settings');
    }
};

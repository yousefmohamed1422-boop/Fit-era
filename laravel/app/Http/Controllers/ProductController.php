<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * List all products.
     */
    public function index()
    {
        $products = Product::orderBy('created_at', 'desc')->get();
        return response()->json($products);
    }

    /**
     * Show single product by slug or ID.
     */
    public function show($slug)
    {
        $product = Product::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        return response()->json($product);
    }

    /**
     * Create a new product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'was' => 'nullable|numeric',
            'shape' => 'nullable|string',
            'colors' => 'nullable|array',
            'sizes' => 'nullable|array',
            'badge' => 'nullable|string',
            'desc' => 'nullable|string',
            'fabric' => 'nullable|string',
            'fit' => 'nullable|string',
            'model_info' => 'nullable|string',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'color_images' => 'nullable|array',
        ]);

        $id = $request->id ?: Str::slug($validated['name']) . '-' . Str::random(4);
        $slug = Str::slug($validated['name']);

        $product = Product::create(array_merge($validated, [
            'id' => $id,
            'slug' => $slug,
        ]));

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'was' => 'nullable|numeric',
            'shape' => 'nullable|string',
            'colors' => 'nullable|array',
            'sizes' => 'nullable|array',
            'badge' => 'nullable|string',
            'desc' => 'nullable|string',
            'fabric' => 'nullable|string',
            'fit' => 'nullable|string',
            'model_info' => 'nullable|string',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'color_images' => 'nullable|array',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}

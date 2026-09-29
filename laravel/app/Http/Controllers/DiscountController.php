<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DiscountCode;

class DiscountController extends Controller
{
    /**
     * List all discount codes (Admin).
     */
    public function index()
    {
        $discounts = DiscountCode::all()->pluck('percentage', 'code');
        return response()->json($discounts);
    }

    /**
     * Validate a promo code from customer checkout.
     */
    public function validateCode(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $clean = strtoupper(trim($request->code));

        $discount = DiscountCode::where('code', $clean)
            ->where('is_active', true)
            ->first();

        if (!$discount) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid or expired discount code.',
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'code' => $discount->code,
            'percentage' => $discount->percentage,
            'discount' => $discount->percentage / 100,
        ]);
    }

    /**
     * Create or update discount code (Admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'pct' => 'required|integer|min:1|max:100',
        ]);

        $code = strtoupper(trim($validated['code']));
        $discount = DiscountCode::updateOrCreate(
            ['code' => $code],
            ['percentage' => $validated['pct'], 'is_active' => true]
        );

        return response()->json([
            'message' => 'Discount saved successfully',
            'discount' => $discount,
        ]);
    }

    /**
     * Delete discount code.
     */
    public function destroy($code)
    {
        DiscountCode::where('code', strtoupper($code))->delete();
        return response()->json(['message' => 'Discount deleted successfully']);
    }
}

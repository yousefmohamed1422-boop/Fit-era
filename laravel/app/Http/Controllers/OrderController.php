<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * List all orders (Admin).
     */
    public function index()
    {
        $orders = Order::with('items')->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    /**
     * Store / Place a new order from storefront checkout.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer.name' => 'required|string|min:2',
            'customer.whatsapp' => 'required|string|min:9',
            'customer.email' => 'nullable|email',
            'shipping.city' => 'required|string',
            'shipping.address' => 'required|string|min:6',
            'shipping.notes' => 'nullable|string',
            'payment' => 'required|string',
            'code' => 'nullable|string',
            'total' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|string',
            'items.*.name' => 'required|string',
            'items.*.colorName' => 'nullable|string',
            'items.*.size' => 'nullable|string',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'items.*.hex' => 'nullable|string',
            'items.*.image' => 'nullable|string',
        ]);

        $order = DB::transaction(function () use ($validated) {
            // Generate clean unique FE-XXXX order number
            $number = 'FE-' . mt_rand(1100, 9999);
            while (Order::where('number', $number)->exists()) {
                $number = 'FE-' . mt_rand(1100, 9999);
            }

            $order = Order::create([
                'number' => $number,
                'customer_name' => $validated['customer']['name'],
                'customer_whatsapp' => $validated['customer']['whatsapp'],
                'customer_email' => $validated['customer']['email'] ?? null,
                'shipping_city' => $validated['shipping']['city'],
                'shipping_address' => $validated['shipping']['address'],
                'shipping_notes' => $validated['shipping']['notes'] ?? null,
                'payment_method' => $validated['payment'],
                'discount_code' => $validated['code'] ?? null,
                'total' => $validated['total'],
                'step' => 0, // Order received
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'] ?? null,
                    'name' => $item['name'],
                    'color_name' => $item['colorName'] ?? null,
                    'size' => $item['size'] ?? null,
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'hex' => $item['hex'] ?? null,
                    'image' => $item['image'] ?? null,
                ]);
            }

            return $order->load('items');
        });

        // Optional: Trigger WhatsApp confirmation webhook or notification here

        return response()->json([
            'message' => 'Order placed successfully',
            'order' => $order,
        ], 201);
    }

    /**
     * Track an order by order number (with optional phone check).
     */
    public function track(Request $request, $number)
    {
        $cleanNumber = strtoupper(trim(str_replace('#', '', $number)));
        $order = Order::with('items')->where('number', $cleanNumber)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $phone = $request->query('phone');
        if ($phone) {
            $cleanInput = preg_replace('/\D/', '', $phone);
            $cleanSaved = preg_replace('/\D/', '', $order->customer_whatsapp);
            if (substr($cleanInput, -9) !== substr($cleanSaved, -9)) {
                return response()->json(['message' => 'Phone number does not match this order.'], 403);
            }
        }

        return response()->json([
            'order' => $order,
        ]);
    }

    /**
     * Update order status step (0=Received, 1=Confirmed, 2=Packed, 3=Shipped, 4=Delivered).
     */
    public function updateStatus(Request $request, $number)
    {
        $request->validate([
            'step' => 'required|integer|min:0|max:4',
        ]);

        $order = Order::where('number', $number)->firstOrFail();
        $order->update(['step' => $request->step]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ]);
    }
}

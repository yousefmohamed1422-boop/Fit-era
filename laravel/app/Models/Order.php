<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'customer_name',
        'customer_whatsapp',
        'customer_email',
        'shipping_city',
        'shipping_address',
        'shipping_notes',
        'payment_method',
        'discount_code',
        'subtotal',
        'shipping_cost',
        'total',
        'step',
        'demo',
    ];

    protected $casts = [
        'step' => 'integer',
        'total' => 'float',
        'demo' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Map database columns to the exact frontend format expected by React.
     */
    public function toArray()
    {
        $array = parent::toArray();
        $array['customer'] = [
            'name' => $this->customer_name,
            'whatsapp' => $this->customer_whatsapp,
            'email' => $this->customer_email,
        ];
        $array['shipping'] = [
            'city' => $this->shipping_city,
            'address' => $this->shipping_address,
            'notes' => $this->shipping_notes,
        ];
        $array['payment'] = $this->payment_method;
        $array['code'] = $this->discount_code;
        return $array;
    }
}

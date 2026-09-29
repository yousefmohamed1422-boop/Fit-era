<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'name',
        'color_name',
        'size',
        'qty',
        'price',
        'hex',
        'image',
    ];

    protected $casts = [
        'qty' => 'integer',
        'price' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Map database columns to the camelCase frontend format.
     */
    public function toArray()
    {
        $array = parent::toArray();
        $array['colorName'] = $this->color_name;
        return $array;
    }
}

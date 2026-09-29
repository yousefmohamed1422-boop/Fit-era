<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'slug',
        'name',
        'category',
        'price',
        'was',
        'shape',
        'colors',
        'sizes',
        'badge',
        'rating',
        'reviews',
        'desc',
        'fabric',
        'fit',
        'model_info',
        'image',
        'images',
        'color_images',
    ];

    protected $casts = [
        'price' => 'float',
        'was' => 'float',
        'rating' => 'float',
        'reviews' => 'integer',
        'colors' => 'array',
        'sizes' => 'array',
        'images' => 'array',
        'color_images' => 'array',
    ];

    public function toArray()
    {
        $array = parent::toArray();
        $array['colorImages'] = $this->color_images ?? [];
        return $array;
    }
}

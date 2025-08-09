<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Market extends Model
{
    protected $fillable = [
        'polymarket_id',
        'question',
        'current_probability',
        'volume',
        'category',
        'end_date',
        'active',
        'metadata',
    ];

    protected $casts = [
        'current_probability' => 'decimal:5',
        'volume' => 'decimal:2',
        'end_date' => 'datetime',
        'active' => 'boolean',
        'metadata' => 'array',
    ];

    public function movements(): HasMany
    {
        return $this->hasMany(MarketMovement::class);
    }

    public function priceHistory(): HasMany
    {
        return $this->hasMany(MarketPriceHistory::class);
    }

    public function getLatestMovementAttribute()
    {
        return $this->movements()->latest('movement_detected_at')->first();
    }

    public function scopeWithSignificantMovements($query, $threshold = 10)
    {
        return $query->whereHas('movements', function ($q) use ($threshold) {
            $q->where('change_percentage', '>=', $threshold)
              ->where('movement_detected_at', '>=', now()->subDay());
        });
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}

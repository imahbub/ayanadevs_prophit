<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketMovement extends Model
{
    protected $fillable = [
        'market_id',
        'probability_before',
        'probability_after',
        'change_percentage',
        'movement_started_at',
        'movement_detected_at',
        'volume_during_movement',
        'additional_data',
    ];

    protected $casts = [
        'probability_before' => 'decimal:5',
        'probability_after' => 'decimal:5',
        'change_percentage' => 'decimal:3',
        'movement_started_at' => 'datetime',
        'movement_detected_at' => 'datetime',
        'volume_during_movement' => 'decimal:2',
        'additional_data' => 'array',
    ];

    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }

    public function scopeSignificant($query, $threshold = 10)
    {
        return $query->where('change_percentage', '>=', $threshold);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('movement_detected_at', '>=', now()->subHours($hours));
    }

    public function getFormattedChangeAttribute(): string
    {
        $sign = $this->change_percentage >= 0 ? '+' : '';
        return $sign . number_format($this->change_percentage, 2) . '%';
    }
}

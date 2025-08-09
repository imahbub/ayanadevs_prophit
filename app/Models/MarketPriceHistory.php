<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketPriceHistory extends Model
{
    protected $table = 'market_price_history';
    
    protected $fillable = [
        'market_id',
        'probability',
        'volume',
        'recorded_at',
    ];

    protected $casts = [
        'probability' => 'decimal:5',
        'volume' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }

    public function scopeForTimeRange($query, $start, $end)
    {
        return $query->where('recorded_at', '>=', $start)
                    ->where('recorded_at', '<=', $end);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('recorded_at', '>=', now()->subHours($hours));
    }
}

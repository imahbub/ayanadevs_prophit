<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('market_price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('market_id')->constrained()->onDelete('cascade');
            $table->decimal('probability', 8, 5);
            $table->decimal('volume', 15, 2)->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();
            
            $table->index(['market_id', 'recorded_at']);
            $table->index('recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_price_history');
    }
};

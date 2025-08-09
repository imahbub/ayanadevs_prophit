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
        Schema::create('market_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('market_id')->constrained()->onDelete('cascade');
            $table->decimal('probability_before', 8, 5);
            $table->decimal('probability_after', 8, 5);
            $table->decimal('change_percentage', 8, 3);
            $table->timestamp('movement_started_at');
            $table->timestamp('movement_detected_at');
            $table->decimal('volume_during_movement', 15, 2)->nullable();
            $table->json('additional_data')->nullable();
            $table->timestamps();
            
            $table->index(['market_id', 'movement_detected_at']);
            $table->index('change_percentage');
            $table->index('movement_detected_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_movements');
    }
};

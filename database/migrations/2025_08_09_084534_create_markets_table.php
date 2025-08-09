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
        Schema::create('markets', function (Blueprint $table) {
            $table->id();
            $table->string('polymarket_id')->unique();
            $table->text('question');
            $table->decimal('current_probability', 8, 5);
            $table->decimal('volume', 15, 2)->nullable();
            $table->string('category')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->boolean('active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['active', 'current_probability']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('markets');
    }
};

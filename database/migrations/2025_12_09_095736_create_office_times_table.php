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
        Schema::create('office_times', function (Blueprint $table) {
            $table->id();
            $table->date('start_date');         // range start
            $table->date('end_date');           // range end
            $table->time('in_time')->default('08:00:00');
            $table->time('out_time')->default('14:30:00');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('office_times');
    }
};

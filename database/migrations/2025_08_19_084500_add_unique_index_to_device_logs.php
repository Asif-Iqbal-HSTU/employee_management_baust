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
        Schema::table('device_logs', function (Blueprint $table) {
            $table->unique(['employee_id', 'timestamp'], 'uniq_employee_timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('device_logs', function (Blueprint $table) {
            $table->dropUnique('uniq_employee_timestamp');
        });
    }
};

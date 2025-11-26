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
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason')->nullable();
            $table->text('type')->nullable();
            $table->text('replace')->nullable();
            $table->text('status')->nullable();
//            $table->enum('late_status', ['late', 'on_time', 'holiday', 'leave', 'weekend', 'early_leave', 'absent'])->nullable();
            $table->timestamps();

            // Unique: one row per employee per day
            $table->unique(['employee_id', 'start_date', 'end_date']);

            // Foreign key to users.employee_id
            $table->foreign('employee_id')
                ->references('employee_id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};

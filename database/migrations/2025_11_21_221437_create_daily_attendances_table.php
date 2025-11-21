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
        Schema::create('daily_attendances', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id');
            $table->date('date');
            $table->time('in_time')->nullable();
            $table->time('out_time')->nullable();
            $table->text('status')->nullable();
//            $table->enum('late_status', ['late', 'on_time', 'holiday', 'leave', 'weekend', 'early_leave', 'absent'])->nullable();
            $table->text('remarks')->nullable();  // written by deptHead
            $table->timestamps();

            // Unique: one row per employee per day
            $table->unique(['employee_id', 'date']);

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
        Schema::dropIfExists('daily_attendances');
    }
};

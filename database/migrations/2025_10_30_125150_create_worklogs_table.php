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
        Schema::create('worklogs', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id'); // references users.employee_id
            $table->date('date'); // work date
            $table->time('startTime')->nullable();
            $table->time('endTime')->nullable();
            $table->text('taskDescription'); // description of tasks done
            $table->text('status')->nullable(); // description of tasks done
            $table->timestamps();

            // Foreign key constraint
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
        Schema::dropIfExists('worklogs');
    }
};

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
        Schema::create('time_assignments', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id'); // references users.employee_id
            $table->time('allowed_entry')->nullable();
            $table->time('allowed_exit')->nullable();
            $table->json('weekdays')->nullable(); // multiple weekdays
            $table->boolean('loop')->default(true); // whether to loop weekly
            $table->timestamps();

            $table->foreign('employee_id')
                ->references('employee_id')
                ->on('users')
                ->onDelete('cascade');

            $table->unique('employee_id'); // one rule per employee
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_assignments');
    }
};

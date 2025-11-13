<?php

// database/migrations/xxxx_xx_xx_create_repair_requests_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('repair_requests', function (Blueprint $table) {
            $table->id();
//            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // submitter
            $table->string('employee_id'); // references users.employee_id
            $table->string('department');
            $table->date('submission_date');
            $table->time('submission_time')->nullable();
            $table->string('contact_person');
            $table->string('designation')->nullable();
            $table->string('contact_no');
            $table->string('email')->nullable();
            $table->string('device_type');
            $table->string('brand_model')->nullable();
            $table->string('asset_id')->nullable();
            $table->string('serial_number')->nullable();
            $table->json('accessories')->nullable();
            $table->text('problem_description')->nullable();

            // IT Repair Cell Part
            $table->string('job_id')->nullable();
            $table->date('date_received')->nullable();
            $table->string('received_by')->nullable();
            $table->text('initial_observation')->nullable();
            $table->date('expected_delivery')->nullable();
            $table->string('assigned_to')->nullable();
            $table->string('assigned_phone')->nullable();

            $table->enum('status', ['Pending', 'In Progress', 'Completed', 'Delivered'])->default('Pending');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('employee_id')
                ->references('employee_id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('repair_requests');
    }
};


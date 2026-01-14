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
        Schema::create('issue_vouchers', function (Blueprint $table) {
            $table->id();

            $table->string('sl_no')->nullable();
            $table->string('book_no')->nullable();
            $table->foreignId('store_product_id')->constrained('store_products')->onDelete('cascade');
            // Employee relations
            $table->string('requisition_employee_id');
            $table->foreign('requisition_employee_id')
                ->references('employee_id')
                ->on('users')
                ->onDelete('cascade');

            $table->string('receiver')->nullable();

            // Department
            $table->foreignId('department_id')
                ->constrained('departments')
                ->onDelete('cascade');

//            $table->string('specification')->nullable();
            $table->string('to_be_used_in')->nullable();
            $table->string('to_be_used_in_category')->nullable(); // Shop/Lab/Office

            $table->date('date');

            // Approval statuses
            $table->string('allowed_by_head')->default('No');
            $table->string('allowed_by_registrar')->default('No');
            $table->string('issued_by_storeman')->default('No');
            $table->integer('requisitioned_quantity');
            $table->integer('issued_quantity')->nullable();
            $table->string('specification')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue_vouchers');
    }
};

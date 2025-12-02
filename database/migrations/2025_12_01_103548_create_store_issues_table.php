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
        Schema::create('store_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_product_id')->constrained('store_products')->onDelete('cascade');
            $table->date('date_of_issue');
            $table->string('budget_code')->nullable();
            $table->foreignId('issue_voucher_id')->constrained('issue_vouchers')->onDelete('cascade');
            $table->integer('issued_quantity')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_issues');
    }
};

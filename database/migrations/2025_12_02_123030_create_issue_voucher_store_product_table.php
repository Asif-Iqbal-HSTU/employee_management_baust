<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /*public function up(): void
    {
        Schema::create('issue_voucher_store_product', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }*/

    public function up(): void
    {
        Schema::create('issue_voucher_store_product', function (Blueprint $table) {
            $table->id();

            $table->foreignId('issue_voucher_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('store_product_id')
                ->constrained()
                ->onDelete('cascade');

            // Pivot fields
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
        Schema::dropIfExists('issue_voucher_store_product');
    }
};

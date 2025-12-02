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
        Schema::create('store_receives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_product_id')->constrained('store_products')->onDelete('cascade');
            $table->date('date_of_receive');
            $table->string('from_whom');
            $table->string('memo_no');
            $table->date('memo_date');
            $table->string('office_order_no');
            $table->double('rate');
            $table->integer('quantity');
            $table->string('warranty_information')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_receives');
    }
};

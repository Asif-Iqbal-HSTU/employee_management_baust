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
        Schema::create('store_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_category_id')->constrained('store_categories')->onDelete('cascade');
            $table->string('product_name');
            $table->string('stock_unit_name');
            $table->integer('stock_unit_number');
            $table->timestamps();
        });
    }*/

    public function up(): void
    {
        Schema::create('store_products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('store_category_id')
                ->constrained('store_categories')
                ->onDelete('cascade');

            $table->string('product_name');
            $table->string('stock_unit_name');
            $table->string('product_image')->nullable();

            $table->integer('stock_unit_number');

            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_products');
    }
};

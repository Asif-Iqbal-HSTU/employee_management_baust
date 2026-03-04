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
        Schema::create('employee_details', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique();
            $table->string('name_bangla')->nullable();
            $table->string('post')->nullable();
            $table->string('employment_type')->nullable();      // Perm / Contract etc.
            $table->string('gender')->nullable();
            $table->text('joining_date')->nullable();            // text because it can have multiple lines
            $table->string('date_of_birth')->nullable();
            $table->string('nid_no')->nullable();
            $table->string('mobile_no')->nullable();
            $table->text('parents_name')->nullable();            // can have both father & mother
            $table->text('address')->nullable();
            $table->string('district')->nullable();
            $table->string('employee_class')->nullable();        // 1st Class, 2nd Class, etc.
            $table->string('department_from_sheet')->nullable(); // department as written in excel
            $table->timestamps();

            $table->foreign('employee_id')->references('employee_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_details');
    }
};

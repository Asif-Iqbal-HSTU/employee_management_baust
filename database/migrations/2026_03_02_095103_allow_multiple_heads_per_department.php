<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Must drop foreign key first before dropping the unique index
        Schema::table('dept_heads', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropUnique(['department_id']);
        });

        Schema::table('dept_heads', function (Blueprint $table) {
            // Re-add the foreign key without unique constraint
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
            // Composite unique: prevent same person assigned twice to same department
            $table->unique(['department_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::table('dept_heads', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropUnique(['department_id', 'employee_id']);
        });

        Schema::table('dept_heads', function (Blueprint $table) {
            $table->unique('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
        });
    }
};

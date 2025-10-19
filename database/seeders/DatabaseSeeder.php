<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $users = [
            [
                'name' => 'Dr. Md Nakib Hayat Chowdhury',
                'employee_id' => '15025',
                'email' => 'nakib@baust.edu.bd',
                'password' => Hash::make('15025'),
                'remember_token' => Str::random(10),
            ]
        ];

        DB::table('users')->insert($users);
    }
}

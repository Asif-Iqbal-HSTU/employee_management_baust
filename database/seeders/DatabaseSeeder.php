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
                'name' => 'Dhiraj Chandra Barman',
                'employee_id' => '24079',
                'email' => 'dhiraj@example.com',
                'password' => Hash::make('12341234'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Md. Alamgir Hoque',
                'employee_id' => '25030',
                'email' => 'alamgir@example.com',
                'password' => Hash::make('12341234'),
                'remember_token' => Str::random(10),
            ],
            [
                'name' => 'Md. Miraz Hossain',
                'employee_id' => '25028',
                'email' => 'miraz@example.com',
                'password' => Hash::make('12341234'),
                'remember_token' => Str::random(10),
            ],
        ];

        DB::table('users')->insert($users);
    }
}

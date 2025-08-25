<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:send-department-attendance')
    ->dailyAt('11:39')
    ->timezone('Asia/Dhaka'); // Adjust to your timezone

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

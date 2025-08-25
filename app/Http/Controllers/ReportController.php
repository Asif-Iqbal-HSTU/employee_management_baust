<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class ReportController extends Controller
{
    public function sendAttendanceReport()
    {
        Artisan::call('report:send-department-attendance');

        return back()->with('success', 'Attendance report sent to department heads!');
    }
}


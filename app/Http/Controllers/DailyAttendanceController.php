<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\DeviceLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DailyAttendanceController extends Controller
{
    public function generateDailyAttendance(): \Illuminate\Http\JsonResponse
    {
        // Group raw logs by employee + date
        $records = DeviceLog::select(
            'employee_id',
            DB::raw('DATE(`timestamp`) as day'),
            DB::raw('MIN(`timestamp`) as in_time'),
            DB::raw('MAX(`timestamp`) as out_time')
        )
            ->groupBy('employee_id', 'day')
            ->get();

        foreach ($records as $r) {

            $in  = Carbon::parse($r->in_time)->format('H:i');
            $out = Carbon::parse($r->out_time)->format('H:i');

            // Status calculation
            $status = [];
            if ($in > '08:00')  $status[] = 'late entry';
            if ($out < '14:30') $status[] = 'early leave';

            DailyAttendance::updateOrCreate(
                [
                    'employee_id' => $r->employee_id,
                    'date'        => $r->day,
                ],
                [
                    'in_time'  => $in,
                    'out_time' => $out,
                    'status'   => implode(', ', $status) ?: 'ok',
                ]
            );
        }

        return response()->json(['message' => 'Daily attendance generated']);
    }
}


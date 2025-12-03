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

            $in  = Carbon::parse($r->in_time)->format('H:i:s');
            $out = Carbon::parse($r->out_time)->format('H:i:s');

            // Status calculation
            $status = [];
            if ($in > '08:30:00')  $status[] = 'late entry';
            if ($out < '14:30:00') $status[] = 'early leave';

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

    public function calendar(Request $request)
    {
        $employeeId = auth()->user()->employee_id;

        $month = $request->query('month', now()->format('Y-m'));

        $start = Carbon::parse($month)->startOfMonth();
        $end   = Carbon::parse($month)->endOfMonth();

        // Get first and last entry per day
        $logs = DeviceLog::selectRaw("
            DATE(timestamp) as day,
            MIN(timestamp) as first_in,
            MAX(timestamp) as last_out
        ")
            ->where('employee_id', $employeeId)
            ->whereBetween('timestamp', [$start, $end])
            ->groupBy('day')
            ->get();

        // Get holidays for the month
        $holidays = Holiday::whereBetween('date', [$start, $end])->pluck('date')->map(fn($d) => $d->format('Y-m-d'));

        // Prepare events for FullCalendar
        $events = [];

        // Add attendance logs
        foreach ($logs as $log) {
            $day = $log->day;

            // Determine status
            $status = 'present';
            $color  = '#16a34a'; // green

            // Late rule → IN time after 9:15 AM
            if ($log->first_in && Carbon::parse($log->first_in)->gt(Carbon::parse($day . ' 09:15:00'))) {
                $status = 'late';
                $color  = '#ca8a04'; // yellow
            }

            $events[] = [
                'title' => "IN: " . Carbon::parse($log->first_in)->format('h:i A') .
                    "\nOUT: " . Carbon::parse($log->last_out)->format('h:i A'),
                'start' => $day,
                'color' => $color,
                'extendedProps' => [
                    'status' => $status,
                    'in' => $log->first_in,
                    'out' => $log->last_out,
                ]
            ];
        }

        // Add holidays
        foreach ($holidays as $h) {
            $events[] = [
                'title' => "Holiday",
                'start' => $h,
                'color' => '#0ea5e9', // blue
            ];
        }

        // Mark absent days (no logs, not holiday)
        $period = Carbon::parse($start)->daysUntil($end);

        foreach ($period as $date) {
            $d = $date->format('Y-m-d');
            if (!in_array($d, $holidays) && !$logs->contains('day', $d)) {
                $events[] = [
                    'title' => "Absent",
                    'start' => $d,
                    'color' => '#dc2626', // red
                ];
            }
        }

        return Inertia::render('Attendance/Calendar', [
            'events' => $events,
            'month' => $month,
        ]);
    }

}


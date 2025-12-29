<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\DeviceLog;
use App\Models\OfficeTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\DutyTimeResolver;
use App\Services\AttendanceStatusResolver;

class DailyAttendanceController extends Controller
{
    public function getOfficeTimeForDate($date)
    {
        return OfficeTime::where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first() ?? (object)[
            'in_time'  => '08:00:00',
            'out_time' => '14:30:00'
        ];
    }

    public function generateDailyAttendance0(): \Illuminate\Http\JsonResponse
    {
        $records = DeviceLog::select(
            'employee_id',
            DB::raw('DATE(`timestamp`) as day'),
            DB::raw('MIN(`timestamp`) as in_time'),
            DB::raw('MAX(`timestamp`) as out_time')
        )
            ->groupBy('employee_id', 'day')
            ->get();

        foreach ($records as $r) {

            // Office rule for the date
            $office = $this->getOfficeTimeForDate($r->day);

            $inThresh  = $office->in_time ?: '08:00:00';
            $outThresh = $office->out_time ?: '14:30:00';

            $in  = Carbon::parse($r->in_time)->format('H:i:s');
            $out = Carbon::parse($r->out_time)->format('H:i:s');

            $status = [];
            if ($in > $inThresh)  $status[] = 'late entry';
            if ($out < $outThresh) $status[] = 'early leave';
            if (!$in && !$out) $status[] = 'absent';

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

    public function generateDailyAttendance(): \Illuminate\Http\JsonResponse
    {
        $records = DeviceLog::select(
            'employee_id',
            DB::raw('DATE(timestamp) as day'),
            DB::raw('MIN(timestamp) as in_time'),
            DB::raw('MAX(timestamp) as out_time')
        )
            ->groupBy('employee_id', 'day')
            ->get();

        foreach ($records as $r) {

            $in  = $r->in_time  ? Carbon::parse($r->in_time)->format('H:i:s') : null;
            $out = $r->out_time ? Carbon::parse($r->out_time)->format('H:i:s') : null;

            $timing = DutyTimeResolver::resolve($r->employee_id, $r->day);

            $status = AttendanceStatusResolver::resolve(
                $in,
                $out,
                $timing['start'],
                $timing['end']
            );

            DailyAttendance::updateOrCreate(
                [
                    'employee_id' => $r->employee_id,
                    'date'        => $r->day,
                ],
                [
                    'in_time'  => $in,
                    'out_time' => $out,
                    'status'   => $status,
//                    'remarks'  => $timing['source'],
                ]
            );
        }

        return response()->json([
            'message' => 'Daily attendance generated (roster + office aware)',
        ]);
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


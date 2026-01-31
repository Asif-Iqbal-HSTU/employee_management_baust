<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\DeviceLog;
use App\Models\OfficeTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\DutyTimeResolver;
use App\Services\AttendanceStatusResolver;
use Illuminate\Http\Request;
use App\Models\Holiday;
use Inertia\Inertia;

class DailyAttendanceController extends Controller
{
    public function getOfficeTimeForDate($date)
    {
        return OfficeTime::where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first() ?? (object) [
                'in_time' => '08:00:00',
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

            $inThresh = $office->in_time ?: '08:00:00';
            $outThresh = $office->out_time ?: '14:30:00';

            $in = Carbon::parse($r->in_time)->format('H:i:s');
            $out = Carbon::parse($r->out_time)->format('H:i:s');

            $status = [];
            if ($in > $inThresh)
                $status[] = 'late entry';
            if ($out < $outThresh)
                $status[] = 'early leave';
            if (!$in && !$out)
                $status[] = 'absent';

            DailyAttendance::updateOrCreate(
                [
                    'employee_id' => $r->employee_id,
                    'date' => $r->day,
                ],
                [
                    'in_time' => $in,
                    'out_time' => $out,
                    'status' => implode(', ', $status) ?: 'ok',
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

            $timing = DutyTimeResolver::resolve($r->employee_id, $r->day);

            $in = $r->in_time ? Carbon::parse($r->in_time)->format('H:i:s') : null;
            $out = $r->out_time ? Carbon::parse($r->out_time)->format('H:i:s') : null;

            // --- Smart In-Time Selection ---
            // 1. Check if the IN time is actually the OUT time of the PREVIOUS day's overnight shift
            $prevDay = Carbon::parse($r->day)->subDay()->format('Y-m-d');
            $prevTiming = DutyTimeResolver::resolve($r->employee_id, $prevDay);

            $thisDayAllPunches = DeviceLog::where('employee_id', $r->employee_id)
                ->whereDate('timestamp', $r->day)
                ->orderBy('timestamp', 'asc')
                ->pluck('timestamp');

            if ($thisDayAllPunches->isNotEmpty()) {
                $firstPunch = Carbon::parse($thisDayAllPunches->first());

                $isPrevDayExit = false;

                if ($prevTiming['is_overnight']) {
                    // Logic: If prev day was overnight, and first punch is before 12:00, it belongs to yesterday.
                    if ($firstPunch->format('H:i:s') < '12:00:00') {
                        $isPrevDayExit = true;
                    }
                }

                if ($isPrevDayExit) {
                    // The first punch is consumed by yesterday.
                    // Look for NEXT punch for TODAY's entry.
                    $todaysPunches = $thisDayAllPunches->filter(function ($p) use ($firstPunch) {
                        return Carbon::parse($p)->gt($firstPunch);
                    });

                    if ($todaysPunches->isNotEmpty()) {
                        $in = Carbon::parse($todaysPunches->first())->format('H:i:s');
                        // Out time is the last punch of TODAY, provided it's different/later than IN
                        $actualLast = Carbon::parse($todaysPunches->last());
                        if ($actualLast->gt(Carbon::parse($todaysPunches->first()))) {
                            $out = $actualLast->format('H:i:s');
                        } else {
                            // If only one punch remains for 'today', out is null or same? 
                            // Standard logic usually sets out = in if only 1 punch, or null?
                            // Existing logic was: in=min, out=max. If min==max, in==out.
                            $out = null;
                        }
                    } else {
                        // No punches left for today.
                        $in = null;
                        $out = null;
                    }
                } else {
                    // Standard case: First punch is TODAY's entry
                    // (We effectively rely on the default MIN/MAX above, but we must respect if we overwrote existing defaults?)
                    // The default MIN/MAX at top of loop is correct for standard case.
                    // BUT: we need to handle the "4 hour early" roster check still?
                    // Let's implement that "4 hour" check here if not overnight prev day.

                    if ($timing['source'] === 'roster') {
                        $startThreshold = Carbon::parse($timing['start'])->subHours(4)->format('H:i:s');
                        if ($in && $in < $startThreshold) {
                            // Too early, ignore?
                            // Original logic: "look for better in".
                            // Let's stick closer to original logic for this specific sub-case
                            // to avoid breaking non-overnight rosters.
                            // ... (Check original implementation logic below) ...
                        }
                    }
                }
            }

            // Refined "4 Hour Early" check (from original code, kept for safety)
            if ($in && $timing['source'] === 'roster' && !$prevTiming['is_overnight']) {
                $startThreshold = Carbon::parse($timing['start'])->subHours(4)->format('H:i:s');
                if ($in < $startThreshold) {
                    $betterIn = DeviceLog::where('employee_id', $r->employee_id)
                        ->whereDate('timestamp', $r->day)
                        ->whereTime('timestamp', '>=', $startThreshold)
                        ->orderBy('timestamp', 'asc')
                        ->first();

                    if ($betterIn) {
                        $in = Carbon::parse($betterIn->timestamp)->format('H:i:s');
                    } else {
                        $in = null;
                    }
                }
            }

            if ($timing['is_overnight']) {
                // Search for the last punch on the next day before noon
                $nextDayOut = DeviceLog::where('employee_id', $r->employee_id)
                    ->whereDate('timestamp', Carbon::parse($r->day)->addDay())
                    ->whereTime('timestamp', '<', '12:00:00')
                    ->orderBy('timestamp', 'desc')
                    ->first();

                if ($nextDayOut) {
                    $out = Carbon::parse($nextDayOut->timestamp)->format('H:i:s');
                }
            }

            $status = AttendanceStatusResolver::resolve(
                $in,
                $out,
                $timing['start'],
                $timing['end'],
                $timing['is_overnight']
            );

            DailyAttendance::updateOrCreate(
                [
                    'employee_id' => $r->employee_id,
                    'date' => $r->day,
                ],
                [
                    'in_time' => $in,
                    'out_time' => $out,
                    'status' => $status,
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
        $end = Carbon::parse($month)->endOfMonth();

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
        $holidays = Holiday::whereBetween('date', [$start, $end])->pluck('date')->map(fn($d) => $d->format('Y-m-d'))->toArray();

        // Prepare events for FullCalendar
        $events = [];

        // Add attendance logs
        foreach ($logs as $log) {
            $day = $log->day;

            // Determine status
            $status = 'present';
            $color = '#16a34a'; // green

            // Late rule → IN time after 9:15 AM
            if ($log->first_in && Carbon::parse($log->first_in)->gt(Carbon::parse($day . ' 09:15:00'))) {
                $status = 'late';
                $color = '#ca8a04'; // yellow
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


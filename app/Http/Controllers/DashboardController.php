<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DailyAttendance;
use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index0(Request $request): \Inertia\Response
    {
        $user = $request->user();
        $employeeId = $user->employee_id;

        // Today entry
        $todayEntry = DailyAttendance::where('employee_id', $employeeId)
            ->whereDate('date', today())
            ->first();

        // Last 7 days table
        $logs = DailyAttendance::where('employee_id', $employeeId)
            ->whereBetween('date', [now()->subDays(6)->toDateString(), today()->toDateString()])
            ->orderBy('date', 'desc')
            ->get();

        // Calendar view
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $calendarLogs = DailyAttendance::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->keyBy('date');

        // Holidays with names
        $holidays2025 = Holiday::get()->mapWithKeys(function ($h) {
            return [Carbon::parse($h->date)->format('Y-m-d') => $h->name ?: 'Holiday'];
        })->toArray();

        $holidayDates = array_keys($holidays2025);

        //ABSENCE COUNT
// Generate all working days up to TODAY only
        $startOfMonth = Carbon::create($year, $month, 1);
        $endLimit = now()->toDateString(); // today's date

        $allDates = [];
        $current = $startOfMonth->copy();

        while ($current->toDateString() <= $endLimit) {

            // Skip Friday (5) & Saturday (6)
            if (!in_array($current->dayOfWeek, [5, 6])) {

                // Skip holidays
                if (!in_array($current->format('Y-m-d'), $holidayDates)) {
                    $allDates[] = $current->format('Y-m-d');
                }
            }

            $current->addDay();
        }

        // Fetch all attendance dates for this month
        $attendanceDates = DailyAttendance::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->whereDate('date', '<=', $endLimit)
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        // Calculate absences using date difference
        $absenceCount = collect($allDates)
            ->diff($attendanceDates)
            ->count();


        // Summary counts
        $summary = [
            'late' => DailyAttendance::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'like', '%late entry%')
                ->whereNotIn(DB::raw('DATE(date)'), $holidayDates)
                ->whereRaw('WEEKDAY(date) NOT IN (4,5)')
                ->count(),

            'early' => DailyAttendance::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'like', '%early leave%')
                ->whereNotIn(DB::raw('DATE(date)'), $holidayDates)
                ->whereRaw('WEEKDAY(date) NOT IN (4,5)')
                ->count(),

            /*'absence' => DailyAttendance::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('in_time', NULL)
                ->where('out_time', NULL)
                ->count(),*/

            'absence' => $absenceCount,
        ];

        return Inertia::render('dashboard2', [
            'employeeId' => $employeeId,
            'todayEntry' => $todayEntry,
            'logs' => $logs,
            'calendarLogs' => $calendarLogs,
            'holidays2025' => $holidays2025,
            'summary' => $summary,
            'month' => $month,
            'year' => $year,
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $employeeId = $user->employee_id;

        /* ===========================
         |  Today Entry
         * =========================== */
        $todayEntry = DailyAttendance::where('employee_id', $employeeId)
            ->whereDate('date', today())
            ->first();

        /* ===========================
         |  Last 7 Days Logs
         * =========================== */
        $logs = DailyAttendance::where('employee_id', $employeeId)
            ->whereBetween('date', [
                now()->subDays(6)->toDateString(),
                today()->toDateString()
            ])
            ->orderBy('date', 'desc')
            ->get();

        /* ===========================
         |  Calendar View
         * =========================== */
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);

        $calendarLogs = DailyAttendance::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->keyBy(fn($row) => Carbon::parse($row->date)->format('Y-m-d'));

        /* ===========================
         |  Holidays
         * =========================== */
        $holidays = Holiday::get()->mapWithKeys(function ($h) {
            return [
                Carbon::parse($h->date)->format('Y-m-d') => $h->name ?: 'Holiday'
            ];
        })->toArray();

        $holidayDates = array_keys($holidays);

        /* ===========================
         |  Leaves (Fetch & Merge)
         * =========================== */
        $leaves = \App\Models\Leave::where('employee_id', $employeeId)
            ->where(function ($q) {
                $q->where('status', 'Sent to Registrar')
                    ->orWhere('status', 'Approved by Registrar')
                    ->orWhere('status', 'Approved by VC');
            })
            ->whereDate('start_date', '<=', Carbon::create($year, $month)->endOfMonth())
            ->whereDate('end_date', '>=', Carbon::create($year, $month)->startOfMonth())
            ->get();

        $leaveDates = [];
        foreach ($leaves as $leave) {
            $period = \Carbon\CarbonPeriod::create($leave->start_date, $leave->end_date);
            foreach ($period as $date) {
                $d = $date->format('Y-m-d');
                $leaveDates[] = $d;

                if ($calendarLogs->has($d)) {
                    // Log exists (User Present + On Leave)
                    // We force status to "On Leave" so frontend renders it as leave
                    $log = $calendarLogs->get($d);
                    $log->status = 'On Leave (' . $leave->type . ')';
                } else {
                    // Add to calendarLogs if missing
                    $calendarLogs->put($d, (object) [
                        'id' => null,
                        'employee_id' => $employeeId,
                        'date' => $d,
                        'in_time' => null,
                        'out_time' => null,
                        'status' => 'On Leave (' . $leave->type . ')',
                        'remarks' => $leave->status,
                    ]);
                }
            }
        }

        /* ===========================
         |  ABSENCE CALCULATION (FIXED)
         * =========================== */
        $startOfMonth = Carbon::create($year, $month, 1);
        $today = Carbon::today();

        // Get user's rosters for this month
        $rosteredDates = \App\Models\DutyRoster::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        // Decide correct end date
        if ($year === $today->year && $month === $today->month) {
            // Current month → up to today
            $endDate = $today;
        } elseif ($startOfMonth->isFuture()) {
            // Future month → no absences
            $absenceCount = 0;
            goto SUMMARY;
        } else {
            // Past month → full month
            $endDate = $startOfMonth->copy()->endOfMonth();
        }

        // Build working days
        $workingDays = [];
        $cursor = $startOfMonth->copy();

        while ($cursor->lte($endDate)) {
            $currentDate = $cursor->format('Y-m-d');
            $isRostered = in_array($currentDate, $rosteredDates);

            // Include if rostered OR (Not Weekend & Not Holiday)
            if ($isRostered || (!in_array($cursor->dayOfWeek, [5, 6]) && !in_array($currentDate, $holidayDates))) {
                $workingDays[] = $currentDate;
            }

            $cursor->addDay();
        }

        // Attendance days in selected range
        $attendanceDays = DailyAttendance::where('employee_id', $employeeId)
            ->whereBetween('date', [
                $startOfMonth->toDateString(),
                $endDate->toDateString()
            ])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        // Final absence count (Working Days - Attendance - Leaves)
        $absenceCount = collect($workingDays)
            ->diff($attendanceDays)
            ->diff($leaveDates)
            ->count();

        /* ===========================
         |  SUMMARY
         * =========================== */
        SUMMARY:

        $baseSummaryQuery = DailyAttendance::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

        // We want to count late/early if:
        // 1. It happened on a rostered date
        // OR
        // 2. It happened on a normal working day (Not Weekend & Not Holiday)

        $summary = [
            'late' => (clone $baseSummaryQuery)
                ->where('status', 'like', '%late entry%')
                ->where(function ($q) use ($rosteredDates, $holidayDates) {
                    $q->whereIn('date', $rosteredDates)
                        ->orWhere(function ($sq) use ($holidayDates) {
                            $sq->whereRaw('WEEKDAY(date) NOT IN (4,5)')
                                ->whereNotIn(DB::raw('DATE(date)'), $holidayDates);
                        });
                })
                ->count(),

            'early' => (clone $baseSummaryQuery)
                ->where('status', 'like', '%early leave%')
                ->where(function ($q) use ($rosteredDates, $holidayDates) {
                    $q->whereIn('date', $rosteredDates)
                        ->orWhere(function ($sq) use ($holidayDates) {
                            $sq->whereRaw('WEEKDAY(date) NOT IN (4,5)')
                                ->whereNotIn(DB::raw('DATE(date)'), $holidayDates);
                        });
                })
                ->count(),

            'absence' => $absenceCount,
        ];

        /* ===========================
         |  RESPONSE
         * =========================== */
        $userDesignation = $user->assignment?->designation?->designation_name;

        return Inertia::render('dashboard2', [
            'employeeId' => $employeeId,
            'userDesignation' => $userDesignation,
            'todayEntry' => $todayEntry,
            'logs' => $logs,
            'calendarLogs' => $calendarLogs,
            'dutyRosters' => \App\Models\DutyRoster::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get()
                ->keyBy('date'),
            'holidays2025' => $holidays,
            'summary' => $summary,
            'month' => $month,
            'year' => $year,
        ]);
    }


    public function employeeCalendar(Request $request, $employeeId)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $calendarLogs = DailyAttendance::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->keyBy('date');

        $holidays2025 = Holiday::get()->mapWithKeys(function ($h) {
            return [Carbon::parse($h->date)->format('Y-m-d') => $h->name ?: 'Holiday'];
        })->toArray();

        return response()->json([
            'calendarLogs' => $calendarLogs,
            'holidays2025' => $holidays2025,
            'month' => $month,
            'year' => $year
        ]);
    }

}

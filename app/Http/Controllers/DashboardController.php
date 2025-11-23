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
    public function index(Request $request)
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
        $year  = $request->input('year', now()->year);

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

            'absence' => DailyAttendance::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'absent')
                ->count(),
        ];

        return Inertia::render('dashboard2', [
            'employeeId'   => $employeeId,
            'todayEntry'   => $todayEntry,
            'logs'         => $logs,
            'calendarLogs' => $calendarLogs,
            'holidays2025' => $holidays2025,
            'summary'      => $summary,
            'month'        => $month,
            'year'         => $year,
        ]);
    }
}

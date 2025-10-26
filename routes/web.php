<?php

use App\Http\Controllers\TimeAssignmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Http\Controllers\DeptHeadAttendanceController;
use App\Models\Holiday;
use App\Http\Controllers\AttendanceController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/*Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});*/


/*Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $employeeId = auth()->user()->employee_id;
//        dd($employeeId);

        // Today’s entry
        $todayLog = DB::table('device_logs')
            ->where('employee_id', $employeeId)
            ->whereDate('timestamp', Carbon::today())
            ->orderBy('timestamp')
            ->pluck('timestamp');

//        dd($todayLog);

        $todayEntry = $todayLog->count() > 0
            ? Carbon::parse($todayLog->first())->format('H:i')
            : null;

//        dd($todayEntry);

        // Last 7 days logs
        $logs = collect();
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::today()->subDays($i);
            $dailyLogs = DB::table('device_logs')
                ->where('employee_id', $employeeId)
                ->whereDate('timestamp', $date)
                ->orderBy('timestamp')
                ->pluck('timestamp');

            $in = $dailyLogs->count() > 0
                ? Carbon::parse($dailyLogs->first())->format('H:i')
                : 'Absent';
            $out = $dailyLogs->count() > 1 && $dailyLogs->last() !== $dailyLogs->first()
                ? Carbon::parse($dailyLogs->last())->format('H:i')
                : '';

            $logs->push([
                'date' => $date->toDateString(),
                'in_time' => $in,
                'out_time' => $out,
            ]);
        }

//        dd($logs);

        return Inertia::render('dashboard', [
            'todayEntry' => $todayEntry,
            'logs' => $logs,
            'employeeId' => $employeeId,
        ]);
    })->name('dashboard');
});*/

/*Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $employeeId = auth()->user()->employee_id;

        // --- Today’s first entry (HH:mm)
        $todayLog = DB::table('device_logs')
            ->where('employee_id', $employeeId)
            ->whereDate('timestamp', Carbon::today())
            ->orderBy('timestamp')
            ->pluck('timestamp');

        $todayEntry = $todayLog->count() > 0
            ? Carbon::parse($todayLog->first())->format('H:i')
            : null;

        // --- Last 7 days (your existing table)
        $logs = collect();
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::today()->subDays($i);
            $daily = DB::table('device_logs')
                ->where('employee_id', $employeeId)
                ->whereDate('timestamp', $date)
                ->orderBy('timestamp')
                ->pluck('timestamp');

            $in = $daily->count() > 0 ? Carbon::parse($daily->first())->format('H:i') : 'Absent';
            $out = $daily->count() > 1 && $daily->last() !== $daily->first()
                ? Carbon::parse($daily->last())->format('H:i')
                : '';

            $logs->push([
                'date' => $date->toDateString(),
                'in_time' => $in,
                'out_time' => $out,
            ]);
        }

        // --- Calendar data for the whole current month (first/last punch per date)
        $start = Carbon::today()->startOfMonth();
        $end   = Carbon::today()->endOfMonth();

        // Group by DATE(timestamp) to get first & last record of each day
        $calendarRows = DB::table('device_logs')
            ->selectRaw('DATE(timestamp) as d, MIN(timestamp) as first_ts, MAX(timestamp) as last_ts')
            ->where('employee_id', $employeeId)
            ->whereBetween('timestamp', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->groupBy('d')
            ->orderBy('d', 'asc')
            ->get();

        // Build a map date => {in_time, out_time}
        $byDate = [];
        foreach ($calendarRows as $row) {
            $in  = $row->first_ts ? Carbon::parse($row->first_ts)->format('H:i') : null;
            $out = $row->last_ts && $row->last_ts !== $row->first_ts
                ? Carbon::parse($row->last_ts)->format('H:i')
                : '';
            $byDate[$row->d] = ['in_time' => $in ?? 'Absent', 'out_time' => $out];
        }

        // Fill all days of the month so Absent shows up
        $calendarLogs = [];

        $holidays2025 = collect([
            '2025-02-15','2025-02-21','2025-03-26','2025-03-28',
            '2025-03-29','2025-03-30','2025-03-31','2025-04-01','2025-04-02','2025-04-03',
            '2025-04-14','2025-05-01','2025-05-11',
            '2025-06-05','2025-06-06','2025-06-07','2025-06-08','2025-06-09','2025-06-10',
            '2025-07-06','2025-08-05','2025-08-16','2025-09-05','2025-10-01','2025-10-02',
            '2025-12-16','2025-12-25',
        ])->map(fn($d) => Carbon::parse($d)->toDateString());

        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $key = $d->toDateString();

            $isHoliday = $holidays2025->contains($key);
            $isWeekend = in_array($d->dayOfWeek, [5, 6]); // Fri=5, Sat=6
            $isFuture  = $d->gt(Carbon::today());

            if (array_key_exists($key, $byDate)) {
                $calendarLogs[] = [
                    'date' => $key,
                    'in_time' => $byDate[$key]['in_time'],
                    'out_time' => $byDate[$key]['out_time'],
                ];
            } elseif ($isHoliday) {
                $calendarLogs[] = [
                    'date' => $key,
                    'in_time' => 'Holiday',
                    'out_time' => '',
                ];
            } elseif ($isWeekend) {
                $calendarLogs[] = [
                    'date' => $key,
                    'in_time' => 'Weekend',
                    'out_time' => '',
                ];
            } elseif ($isFuture) {
                $calendarLogs[] = [
                    'date' => $key,
                    'in_time' => '',
                    'out_time' => '',
                ];
            } else {
                $calendarLogs[] = [
                    'date' => $key,
                    'in_time' => 'Absent',
                    'out_time' => '',
                ];
            }
        }

        $absence = 0;
        $late = 0;
        $early = 0;

        foreach ($calendarLogs as $row) {
            if ($row['in_time'] === 'Absent') {
                $absence++;
            } elseif ($row['in_time'] && $row['in_time'] !== 'Holiday' && $row['in_time'] !== 'Weekend') {
                if ($row['in_time'] > '08:00') $late++;
                if ($row['out_time'] && $row['out_time'] < '14:30') $early++;
            }
        }

        $summary = [
            'absence' => $absence,
            'late' => $late,
            'early' => $early,
        ];


        return Inertia::render('dashboard', [
            'todayEntry'   => $todayEntry,
            'logs'         => $logs,           // last 7 days table
            'calendarLogs' => $calendarLogs,   // full month for calendar
            'employeeId'   => $employeeId,
            'holidays2025'   => $holidays2025,
            'summary' => $summary,
        ]);
    })->name('dashboard');
});*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $employeeId = auth()->user()->employee_id;

        $month = (int) request('month', now()->month);
        $year  = (int) request('year', now()->year);

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end   = Carbon::create($year, $month, 1)->endOfMonth();
        $today = Carbon::today();

        // --- Today’s first entry
        $todayLog = DB::table('device_logs')
            ->where('employee_id', $employeeId)
            ->whereDate('timestamp', $today)
            ->orderBy('timestamp')
            ->pluck('timestamp');

        $todayEntry = $todayLog->count() > 0
            ? Carbon::parse($todayLog->first())->format('H:i')
            : null;

        // --- Last 7 days
        $logs = collect();
        for ($i = 0; $i < 7; $i++) {
            $date = $today->copy()->subDays($i);
            $daily = DB::table('device_logs')
                ->where('employee_id', $employeeId)
                ->whereDate('timestamp', $date)
                ->orderBy('timestamp')
                ->pluck('timestamp');

            $in = $daily->count() > 0 ? Carbon::parse($daily->first())->format('H:i') : 'Absent';
            $out = $daily->count() > 1 && $daily->last() !== $daily->first()
                ? Carbon::parse($daily->last())->format('H:i')
                : '';

            $logs->push([
                'date' => $date->toDateString(),
                'in_time' => $in,
                'out_time' => $out,
            ]);
        }

        // --- Monthly attendance
        $calendarRows = DB::table('device_logs')
            ->selectRaw('DATE(timestamp) as d, MIN(timestamp) as first_ts, MAX(timestamp) as last_ts')
            ->where('employee_id', $employeeId)
            ->whereBetween('timestamp', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->groupBy('d')
            ->orderBy('d', 'asc')
            ->get();

        $byDate = [];
        foreach ($calendarRows as $row) {
            $in  = $row->first_ts ? Carbon::parse($row->first_ts)->format('H:i') : null;
            $out = ($row->last_ts && $row->last_ts !== $row->first_ts)
                ? Carbon::parse($row->last_ts)->format('H:i')
                : null;
            $byDate[$row->d] = ['in_time' => $in, 'out_time' => $out];
        }

        // ✅ Fetch holidays from DB
        $holidayData = Holiday::whereBetween('date', [$start, $end])->get();
        $holidayDates = $holidayData->pluck('date')->map->toDateString();
        $holidayNames = $holidayData->pluck('name', 'date')->filter();

        // --- Build calendar
        $calendarLogs = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $dateStr   = $d->toDateString();
            $hasPunch  = array_key_exists($dateStr, $byDate);
            $isHoliday = $holidayDates->contains($dateStr);
            $isWeekend = in_array($d->dayOfWeek, [5, 6]); // Fri/Sat
            $isFuture  = $d->gt($today);

            $label = $isHoliday ? ($holidayNames[$dateStr] ?? 'Holiday') : ($isWeekend ? 'Weekend' : null);

            if ($hasPunch) {
                $status = $isHoliday ? 'holiday' : ($isWeekend ? 'weekend' : 'present');
                $calendarLogs[] = [
                    'date' => $dateStr,
                    'in_time' => $byDate[$dateStr]['in_time'],
                    'out_time' => $byDate[$dateStr]['out_time'],
                    'status' => $status,
                    'label' => $label,
                ];
            } elseif ($isHoliday) {
                $calendarLogs[] = ['date' => $dateStr, 'in_time' => null, 'out_time' => null, 'status' => 'holiday', 'label' => $label];
            } elseif ($isWeekend) {
                $calendarLogs[] = ['date' => $dateStr, 'in_time' => null, 'out_time' => null, 'status' => 'weekend', 'label' => $label];
            } elseif ($isFuture) {
                $calendarLogs[] = ['date' => $dateStr, 'in_time' => null, 'out_time' => null, 'status' => 'future', 'label' => null];
            } else {
                $calendarLogs[] = ['date' => $dateStr, 'in_time' => null, 'out_time' => null, 'status' => 'absent', 'label' => null];
            }
        }

        // --- Summary
        $absence = $late = $early = 0;
        foreach ($calendarLogs as $row) {
            if ($row['status'] === 'absent') $absence++;
            elseif ($row['status'] === 'present') {
                if ($row['in_time'] && $row['in_time'] > '08:00') $late++;
                if ($row['out_time'] && $row['out_time'] < '14:30') $early++;
            }
        }

        $summary = compact('absence', 'late', 'early');

        return Inertia::render('dashboard', [
            'todayEntry'   => $todayEntry,
            'logs'         => $logs,
            'calendarLogs' => $calendarLogs,
            'employeeId'   => $employeeId,
            'summary'      => $summary,
            'month'        => $month,
            'year'         => $year,
        ]);
    })->name('dashboard');
    /*Route::get('dashboard', function () {
        $employeeId = auth()->user()->employee_id;

        // Accept month/year (fallback to current)
        $month = (int) request('month', now()->month);
        $year  = (int) request('year', now()->year);

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end   = Carbon::create($year, $month, 1)->endOfMonth();
        $today = Carbon::today();

        // --- Today’s first entry (HH:mm)
        $todayLog = DB::table('device_logs')
            ->where('employee_id', $employeeId)
            ->whereDate('timestamp', $today)
            ->orderBy('timestamp')
            ->pluck('timestamp');

        $todayEntry = $todayLog->count() > 0
            ? Carbon::parse($todayLog->first())->format('H:i')
            : null;

        // --- Last 7 days (keep as you had; optional for your table)
        $logs = collect();
        for ($i = 0; $i < 7; $i++) {
            $date = $today->copy()->subDays($i);
            $daily = DB::table('device_logs')
                ->where('employee_id', $employeeId)
                ->whereDate('timestamp', $date)
                ->orderBy('timestamp')
                ->pluck('timestamp');

            $in = $daily->count() > 0 ? Carbon::parse($daily->first())->format('H:i') : 'Absent';
            $out = $daily->count() > 1 && $daily->last() !== $daily->first()
                ? Carbon::parse($daily->last())->format('H:i')
                : '';

            $logs->push([
                'date' => $date->toDateString(),
                'in_time' => $in,
                'out_time' => $out,
            ]);
        }

        // --- Per-day first/last punch for the selected month
        $calendarRows = DB::table('device_logs')
            ->selectRaw('DATE(timestamp) as d, MIN(timestamp) as first_ts, MAX(timestamp) as last_ts')
            ->where('employee_id', $employeeId)
            ->whereBetween('timestamp', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->groupBy('d')
            ->orderBy('d', 'asc')
            ->get();

        $byDate = [];
        foreach ($calendarRows as $row) {
            $in  = $row->first_ts ? Carbon::parse($row->first_ts)->format('H:i') : null;
            $out = ($row->last_ts && $row->last_ts !== $row->first_ts)
                ? Carbon::parse($row->last_ts)->format('H:i')
                : null;
            $byDate[$row->d] = ['in_time' => $in, 'out_time' => $out];
        }

        // --- Holidays (YYYY-MM-DD). Add names if you have them.
        $holidayDates = collect([
            '2025-02-15','2025-02-21','2025-03-26','2025-03-28',
            '2025-03-29','2025-03-30','2025-03-31','2025-04-01','2025-04-02','2025-04-03',
            '2025-04-14','2025-05-01','2025-05-11',
            '2025-06-05','2025-06-06','2025-06-07','2025-06-08','2025-06-09','2025-06-10',
            '2025-07-06','2025-08-05','2025-08-16','2025-09-05','2025-10-01','2025-10-02',
            '2025-12-16','2025-12-25',
        ])->map(fn($d) => Carbon::parse($d)->toDateString());

        // OPTIONAL (names): date => name
        $holidayNames = collect([
             '2025-08-16' => 'Janmashtami',  // example
        ]);

        // --- Build calendar logs with STATUS (present/absent/holiday/weekend/future)
        $calendarLogs = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $dateStr   = $d->toDateString();
            $hasPunch  = array_key_exists($dateStr, $byDate);
            $isHoliday = $holidayDates->contains($dateStr);
            $isWeekend = in_array($d->dayOfWeek, [5, 6]); // Fri=5, Sat=6 (BD weekend)
            $isFuture  = $d->gt($today);

            $label = $isHoliday ? ($holidayNames[$dateStr] ?? 'Holiday') : ($isWeekend ? 'Weekend' : null);

            if ($hasPunch) {
                // show punches; still mark as holiday/weekend if applies (to label the day)
                $status = $isHoliday ? 'holiday' : ($isWeekend ? 'weekend' : 'present');
                $calendarLogs[] = [
                    'date'     => $dateStr,
                    'in_time'  => $byDate[$dateStr]['in_time'],
                    'out_time' => $byDate[$dateStr]['out_time'],
                    'status'   => $status,
                    'label'    => $label,
                ];
            } elseif ($isHoliday) {
                $calendarLogs[] = [
                    'date' => $dateStr,
                    'in_time' => null,
                    'out_time' => null,
                    'status' => 'holiday',
                    'label'  => $label,
                ];
            } elseif ($isWeekend) {
                $calendarLogs[] = [
                    'date' => $dateStr,
                    'in_time' => null,
                    'out_time' => null,
                    'status' => 'weekend',
                    'label'  => $label,
                ];
            } elseif ($isFuture) {
                $calendarLogs[] = [
                    'date' => $dateStr,
                    'in_time' => null,
                    'out_time' => null,
                    'status' => 'future',
                    'label'  => null,
                ];
            } else {
                $calendarLogs[] = [
                    'date' => $dateStr,
                    'in_time' => null,
                    'out_time' => null,
                    'status' => 'absent',
                    'label'  => null,
                ];
            }
        }

        // --- Monthly summary (working days only)
        $absence = 0; $late = 0; $early = 0;
        foreach ($calendarLogs as $row) {
            if ($row['status'] === 'absent') {
                $absence++;
            } elseif ($row['status'] === 'present') {
                if ($row['in_time']  && $row['in_time']  > '08:00') $late++;
                if ($row['out_time'] && $row['out_time'] < '14:30') $early++;
            }
        }

        $summary = ['absence' => $absence, 'late' => $late, 'early' => $early];

        return Inertia::render('dashboard', [
            'todayEntry'    => $todayEntry,
            'logs'          => $logs,
            'calendarLogs'  => $calendarLogs,
            'employeeId'    => $employeeId,
            'holidays2025'  => $holidayDates, // keep if you still need it
            'summary'       => $summary,
            'month'         => $month,
            'year'          => $year,
        ]);
    })->name('dashboard');*/
});

Route::get('/sync-logs', function () {
    return Inertia::render('Logs/sync');
})->name('sync-logs');

//Route::get('/sync-logs', [TimeAssignmentController::class, 'index'])->name('time-assignments.index');

Route::middleware(['auth'])->group(function () {
    Route::get('/time-assignments', [TimeAssignmentController::class, 'index'])->name('time-assignments.index');
    Route::post('/time-assignments', [TimeAssignmentController::class, 'store'])->name('time-assignments.store');
    Route::delete('/time-assignments/{timeAssignment}', [TimeAssignmentController::class, 'destroy'])->name('time-assignments.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dept-head/attendance', [DeptHeadAttendanceController::class, 'index'])
        ->name('depthead.attendance');
    Route::get('/dept-head/employee/{employeeId}/monthly', [DeptHeadAttendanceController::class, 'employeeMonthly'])
        ->name('depthead.employee.monthly');

    Route::get('/departments/{id}/attendance', [AttendanceController::class, 'show'])
        ->name('departments.attendance');

    Route::get('/dept-head/employee/{employeeId}/monthly', [AttendanceController::class, 'deptEmployee'])
        ->name('dept.employee.monthly');

});


Route::get('/dept-head/employee/{employeeId}/monthly', [DeptHeadAttendanceController::class, 'employeeMonthly'])
    ->name('depthead.employee.mon');

Route::get('/zk/logs', [App\Http\Controllers\ZKTecoController::class, 'getLogs']);
Route::get('/zk/users', [App\Http\Controllers\ZKTecoController::class, 'getUsers']);
Route::get('/allEmployeeAttendance', [App\Http\Controllers\AttendanceController::class, 'employeeList'])->name('employeeList');;
Route::get('/employee-attendance/{employeeId}', [App\Http\Controllers\AttendanceController::class, 'getUserAttendance']);
//Route::get('/employee-attendance/{employeeId}', [App\Http\Controllers\AttendanceController::class, 'getUserAttendance']);
Route::get('/today-entry', [App\Http\Controllers\AttendanceController::class, 'todayEntryList'])->name('attendance.today');

Route::get('/socket-check', function () {
    return function_exists('socket_create') ? 'Sockets Enabled' : 'Sockets Not Enabled';
});


Route::get('/device-attendance', [AttendanceController::class, 'deviceLogs'])->name('attendance.device');


//Route::get('/attendance/report', [AttendanceController::class, 'viewReport'])->name('attendance.report');
Route::post('/attendance/sync', [AttendanceController::class, 'syncDeviceLogs'])->name('attendance.sync');


Route::post('/users/sync', [AttendanceController::class, 'syncUsersFromDevices'])->name('users.sync');
//Route::get('/users/sync', [AttendanceController::class, 'syncUsersFromDevices'])->name('users.sync');


Route::post('/logs/sync', [\App\Http\Controllers\DeviceLogController::class, 'syncRawLogs'])->name('logs.sync');
Route::get('/attendance/report', [\App\Http\Controllers\DeviceLogController::class, 'generateReport'])->name('attendance.report');

use App\Http\Controllers\UserAssignmentController;

Route::get('/user-assignments', [UserAssignmentController::class, 'index'])->name('user-assignments.index');
Route::post('/user-assignments', [UserAssignmentController::class, 'store'])->name('user-assignments.store');


Route::get('/departments', [AttendanceController::class, 'departments'])->name('departments');
Route::get('/departmentList', [AttendanceController::class, 'departmentList'])->name('departmentList');
Route::get('/departments/{id}/monthly-report', [AttendanceController::class, 'monthlyReport'])->name('monthlyReport');

Route::get('/late-summary-report', [AttendanceController::class, 'showLateSummaryReport'])->name('late.summary.report');

Route::get('/send-email', [\App\Http\Controllers\EmailController::class, 'sendEmail'])->name('email.send');
Route::get('/logs/last-sync-time', [\App\Http\Controllers\DeviceLogController::class, 'getLastSyncTime'])->name('logs.last_sync_time');
Route::post('/report/send-department-attendance', [\App\Http\Controllers\ReportController::class, 'sendAttendanceReport'])
    ->name('report.send_department');
//Route::get('/attendance/dashboard-data', [\App\Http\Controllers\AttendanceController::class, 'dashboardData'])
//    ->name('attendance.dashboardData');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

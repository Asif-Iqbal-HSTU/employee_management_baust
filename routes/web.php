<?php

use App\Http\Controllers\AttendanceMatrixController;
use App\Http\Controllers\DailyAttendanceController;
use App\Http\Controllers\IssueVoucherController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\OfficeTimeController;
use App\Http\Controllers\ProductVendorController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StoreCategoryController;
use App\Http\Controllers\StoreIssueController;
use App\Http\Controllers\StoreProductController;
use App\Http\Controllers\StoreReceiveController;
use App\Http\Controllers\TimeAssignmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Http\Controllers\DeptHeadAttendanceController;
use App\Models\Holiday;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\WorklogController;
use App\Http\Controllers\RepairRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserAssignmentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/*Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});*/

//Updated
/*Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {

        $user = auth()->user();
        $employeeId = $user->employee_id;

        // Today entry (single row)
        $todayEntry = \App\Models\DailyAttendance::where('employee_id', $employeeId)
            ->whereDate('date', today())
            ->first();

        // Last 7 days table
        $logs = \App\Models\DailyAttendance::where('employee_id', $employeeId)
            ->whereBetween('date', [now()->subDays(6)->toDateString(), today()->toDateString()])
            ->orderBy('date', 'desc')
            ->get();

        // Calendar view for current month
        $month = request('month', now()->month);
        $year  = request('year', now()->year);

        $calendarLogs = \App\Models\DailyAttendance::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->keyBy('date'); // easy lookup on frontend

        $holidays2025 = \App\Models\Holiday::get()->mapWithKeys(function ($h) {
            return [\Carbon\Carbon::parse($h->date)->format('Y-m-d') => $h->name ?: 'Holiday'];
        })->toArray();

// Prepare holiday dates array
        $holidayDates = array_keys($holidays2025); // ['2025-01-01', '2025-02-21', ...]

// Monthly summary (late count, early leave count, absence count)
        $summary = [
            'late' => \App\Models\DailyAttendance::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'like', '%late entry%')
                ->whereNotIn(\DB::raw('DATE(date)'), $holidayDates) // exclude holidays
                ->whereRaw('WEEKDAY(date) NOT IN (4,5)') // exclude Fri=4, Sat=5 (Carbon weekday: Mon=0, Sun=6)
                ->count(),

            'early' => \App\Models\DailyAttendance::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'like', '%early leave%')
                ->whereNotIn(\DB::raw('DATE(date)'), $holidayDates) // exclude holidays
                ->whereRaw('WEEKDAY(date) NOT IN (4,5)') // exclude weekends
                ->count(),

            'absence' => \App\Models\DailyAttendance::where('employee_id', $employeeId)
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
    })->name('dashboard');

});*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});


/*Route::middleware(['auth', 'verified'])->group(function () {
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
});*/

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
//    Route::get('/dept-head/employee/{employeeId}/monthly', [DeptHeadAttendanceController::class, 'employeeMonthly'])
//        ->name('depthead.employee.monthly');

    // routes/web.php
    Route::post('/dept-head/attendance/update-status', [DeptHeadAttendanceController::class, 'updateStatus'])
        ->name('dept.updateStatus');

    Route::post('/dept-head/attendance/update-status/absent', [DeptHeadAttendanceController::class, 'updateAbsentStatus'])
        ->name('dept.updateStatus');


    Route::get('/employee/{employeeId}/calendar', [DashboardController::class, 'employeeCalendar'])
        ->name('employee.calendar');

    Route::get('/departments/{id}/attendance', [AttendanceController::class, 'show'])
        ->name('departments.attendance');

    Route::get('/dept-head/employee/{employeeId}/monthly', [AttendanceController::class, 'deptEmployee'])
        ->name('dept.employee.monthly');

});

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

Route::post('/attendance/sync', [AttendanceController::class, 'syncDeviceLogs'])->name('attendance.sync');

Route::post('/users/sync', [AttendanceController::class, 'syncUsersFromDevices'])->name('users.sync');

Route::post('/logs/sync', [\App\Http\Controllers\DeviceLogController::class, 'syncRawLogs'])->name('logs.sync');
Route::get('/attendance/report', [\App\Http\Controllers\DeviceLogController::class, 'generateReport'])->name('attendance.report');

Route::get('/user-assignments', [UserAssignmentController::class, 'index'])->name('user-assignments.index');
Route::post('/user-assignments', [UserAssignmentController::class, 'store'])->name('user-assignments.store');

Route::get('/departments', [AttendanceController::class, 'departments'])->name('departments');
Route::get('/departmentList', [AttendanceController::class, 'departmentList'])->name('departmentList');
Route::get('/departments/{id}/monthly-report', [AttendanceController::class, 'monthlyReport'])->name('monthlyReport');
Route::get('/departments/{deptId}/report', [AttendanceController::class, 'dateRangeReport'])
    ->name('departments.dateRangeReport');

Route::get('/late-summary-report', [AttendanceController::class, 'showLateSummaryReport'])->name('late.summary.report');

Route::get('/send-email', [\App\Http\Controllers\EmailController::class, 'sendEmail'])->name('email.send');
Route::get('/logs/last-sync-time', [\App\Http\Controllers\DeviceLogController::class, 'getLastSyncTime'])->name('logs.last_sync_time');
Route::post('/report/send-department-attendance', [\App\Http\Controllers\ReportController::class, 'sendAttendanceReport'])
    ->name('report.send_department');

Route::get('/worklog', [WorklogController::class, 'index'])->name('worklog.index');
Route::post('/worklog', [WorklogController::class, 'store'])->name('worklog.store');

Route::get('/departments/{id}/employees', [WorklogController::class, 'showEmployees'])->name('departments.employees');
Route::get('/employees/{employeeId}/worklogs', [WorklogController::class, 'getEmployeeWorklogs'])->name('employees.worklogs');

Route::post('/daily-attendance/generate', [DailyAttendanceController::class, 'generateDailyAttendance'])
    ->name('daily.generate');

Route::get('/leave-management', [LeaveController::class, 'index'])->name('leave.index');
Route::post('/leave-management/request', [LeaveController::class, 'store'])->name('leave.request');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dept-head/leaves', [LeaveController::class, 'indexHead'])
        ->name('deptHead.leaves');

    Route::post('/dept-head/leaves/{id}/approve', [LeaveController::class, 'approveByHead'])
        ->name('deptHead.leaves.approve');

    Route::post('/dept-head/leaves/{id}/deny', [LeaveController::class, 'denyByHead'])
        ->name('deptHead.leaves.deny');

    Route::get(
        '/dept-head/leaves/employee/{employee_id}',
        [LeaveController::class, 'employeeLeaves']
    )->name('deptHead.employee.leaves');

});

use App\Http\Controllers\RegistrarLeaveController;

Route::middleware(['auth', 'verified'])->group(function () {

    // Registrar Leave Panel
    Route::get('/registrar/leave-requests', [RegistrarLeaveController::class, 'index'])
        ->name('registrar.leave.index');

    Route::post('/registrar/leave-requests/{id}/approve', [RegistrarLeaveController::class, 'approve'])
        ->name('registrar.leave.approve');

    Route::post('/registrar/leave-requests/{id}/deny', [RegistrarLeaveController::class, 'deny'])
        ->name('registrar.leave.deny');
});



Route::middleware(['auth'])->group(function () {
    Route::get('/repair-requests', [RepairRequestController::class, 'index'])->name('repair.index');
    Route::get('/repair-requests/create', [RepairRequestController::class, 'create'])->name('repair.create');
    Route::post('/repair-requests', [RepairRequestController::class, 'store'])->name('repair.store');
    Route::post('/repair-requests/{repairRequest}/status', [RepairRequestController::class, 'updateStatus'])->name('repair.updateStatus');
    Route::get('/repair-requests/{repairRequest}/edit', [RepairRequestController::class, 'edit'])->name('repair.edit');
    Route::put('/repair-requests/{repairRequest}', [RepairRequestController::class, 'update'])->name('repair.update');
    Route::get('/repair/{id}/view', [RepairRequestController::class, 'view'])->name('repair.view');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/requisitions', [IssueVoucherController::class, 'index'])->name('voucher.index');
    Route::post('/requisitions-create', [IssueVoucherController::class, 'store'])->name('voucher.create');
    Route::get('/categories', [StoreCategoryController::class, 'index'])->name('category.index');
    Route::get('/category/products/{id}', [StoreCategoryController::class, 'products'])->name('store.products');
    Route::post('/categories-create', [StoreCategoryController::class, 'create'])->name('category.create');
    Route::post('/store-products', [StoreProductController::class, 'store'])
        ->name('store.products.store');
    Route::post('/store-products/receive', [StoreReceiveController::class, 'store'])
        ->name('store.receive.store');

    Route::get('/dept-head/store/requisitions', [IssueVoucherController::class, 'depthead_allow'])->name('voucher.head.allow');
    Route::post('/dept-head/store/requisitions/{voucher}/approve',
        [IssueVoucherController::class, 'approveByHead']
    )->name('voucher.head.approve');

// 💡 NEW ROUTE FOR BULK APPROVAL
    Route::post('/dept-head/store/requisitions/bulk-approve',
        [IssueVoucherController::class, 'bulkApproveByHead']
    )->name('voucher.head.approve.bulk');



    Route::get('/storeman/issues', [StoreIssueController::class, 'storeman_index'])
        ->name('voucher.storeman.index');

    Route::post('/storeman/issues/{voucher}', [StoreIssueController::class, 'storeman_issue'])
        ->name('voucher.storeman.issue');

//    Route::get('/voucher/export/{employee}/{date}', [StoreIssueController::class, 'export'])->name('voucher.export');

    // Route for the AJAX request to get the HTML preview
    Route::get('/voucher/preview/{employee}/{date}', [StoreIssueController::class, 'previewVoucher'])
        ->name('voucher.preview');

// Route for the final PDF stream (used by the button inside the modal)
    Route::get('/voucher/stream/{employee}/{date}', [StoreIssueController::class, 'streamVoucherPdf'])
        ->name('voucher.stream.pdf');

    Route::get(
        '/store/products/{product}/stock-print',
        [StoreIssueController::class, 'printStockRegister']
    )->name('store.product.stock.print');

    Route::post('/product-vendors', [ProductVendorController::class, 'store'])
        ->name('product-vendors.store');


});

Route::get('/attendance/matrix', [AttendanceMatrixController::class, 'form'])
    ->name('attendance.matrix.form');

Route::post('/attendance/matrix/generate', [AttendanceMatrixController::class, 'generate'])
    ->name('attendance.matrix.generate');

Route::get('/attendance/matrix/pdf', [AttendanceMatrixController::class, 'pdf'])
    ->name('attendance.matrix.pdf');

Route::post('/attendance/summary/generate', [AttendanceMatrixController::class, 'summaryGenerate'])
    ->name('attendance.summary.generate');

Route::get('/attendance/summary/pdf', [AttendanceMatrixController::class, 'summaryPdf'])
    ->name('attendance.summary.pdf');


Route::post('/office-time/store', [OfficeTimeController::class, 'store'])
    ->name('office_time.store');


Route::post('/reports/late-summary/download', [ReportController::class, 'downloadPdf']);


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

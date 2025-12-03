<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\Department;
use App\Models\Designation;
use App\Models\DeviceLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use Rats\Zkteco\Lib\ZKTeco;
use Illuminate\Support\Facades\Hash;
use App\Models\Holiday;
//use Carbon\Carbon;
//use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
//    public function dashboardData()
//    {
//        $employeeId = Auth::user()->employee_id;
//
//        // Today entry
//        $todayLog = DB::table('device_logs')
//            ->where('employee_id', $employeeId)
//            ->whereDate('timestamp', Carbon::today())
//            ->orderBy('timestamp')
//            ->pluck('timestamp');
//
//        $todayEntry = $todayLog->count() > 0 ? Carbon::parse($todayLog->first())->format('H:i') : null;
//
//        // Last 7 days
//        $logs = collect();
//        for ($i = 0; $i < 7; $i++) {
//            $date = Carbon::today()->subDays($i);
//            $dailyLogs = DB::table('device_logs')
//                ->where('employee_id', $employeeId)
//                ->whereDate('timestamp', $date)
//                ->orderBy('timestamp')
//                ->pluck('timestamp');
//
//            $in = $dailyLogs->count() > 0 ? Carbon::parse($dailyLogs->first())->format('H:i') : 'Absent';
//            $out = $dailyLogs->count() > 1 && $dailyLogs->last() !== $dailyLogs->first()
//                ? Carbon::parse($dailyLogs->last())->format('H:i')
//                : '';
//
//            $logs->push([
//                'date' => $date->toDateString(),
//                'in_time' => $in,
//                'out_time' => $out,
//            ]);
//        }
//
//        return response()->json([
//            'todayEntry' => $todayEntry,
//            'logs' => $logs,
//            'employeeId' => $employeeId,
//        ]);
//    }
    public function syncUsersFromDevices()
    {
        $deviceIps = ['192.168.10.20', '192.168.10.21', '192.168.10.22'];
        $collected = collect();

        foreach ($deviceIps as $ip) {
            $zk = new \Rats\Zkteco\Lib\ZKTeco($ip);

            if (! $zk->connect()) {
                continue;
            }

            $zk->disableDevice();
            $users = $zk->getUser(); // fetch users
            $zk->enableDevice();
            $zk->disconnect();

            foreach ($users as $user) {
                if (!empty($user['userid'])) {
                    $collected->push([
                        'employee_id' => $user['userid'],
                        'name' => $user['name'] ?? null,
                       /* 'card' => $user['card'] ?? null,
                        'role' => $user['role'] ?? null,*/
                    ]);
                }
            }
        }

        foreach ($collected->unique('employee_id') as $u) {
            User::updateOrCreate(
                ['employee_id' => $u['employee_id']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make($u['employee_id']),
                    /*'card' => $u['card'],
                    'role' => $u['role'],*/
                ]
            );
        }

        return back()->with('success', 'Users synced from all devices.');
    }

    public function syncDeviceLogs()
    {
        $zk = new ZKTeco('192.168.1.201', 4370); // Replace IP

        if (! $zk->connect()) {
            return redirect()->back()->with('error', 'Failed to connect to device.');
        }

        $zk->disableDevice();
        $logs = $zk->getAttendance();
        $zk->enableDevice();
        $zk->disconnect();

        $grouped = collect($logs)
            ->groupBy(fn($log) => $log['id'] . '_' . date('Y-m-d', strtotime($log['timestamp'])))
            ->map(function ($items) {
                $sorted = $items->sortBy('timestamp');
                $first = $sorted->first();
                $last = $sorted->last();
                return [
                    'employee_id' => $first['id'],
                    'date' => date('Y-m-d', strtotime($first['timestamp'])),
                    'in_time' => date('H:i:s', strtotime($first['timestamp'])),
                    'out_time' => date('H:i:s', strtotime($last['timestamp'])),
                ];
            });

        foreach ($grouped as $data) {
            $user = \App\Models\User::where('employee_id', $data['employee_id'])->first();
            if (!$user) continue;

            \App\Models\Attendance::updateOrCreate(
                ['user_id' => $user->id, 'date' => $data['date']],
                ['in_time' => $data['in_time'], 'out_time' => $data['out_time']]
            );
        }

        return redirect()->back()->with('success', 'Device logs synced successfully.');
    }


    public function viewReport(Request $request)
    {
        $date = $request->input('date', today()->toDateString());

        $logs = \App\Models\Attendance::with('user.department')
            ->where('date', $date)
            ->get();

        return view('attendance.report', compact('logs', 'date'));
    }

    public function showLateSummaryReport()
    {
        $summaryTable = [];
        $lateDetails = [];
        $absentDetails = [];
        $date = now()->toDateString();

        // Fetch department-wise employees
        $departments = DB::table('departments')->get();

        foreach ($departments as $dept) {
            $deptId = $dept->id;
            $departmentName = $dept->dept_name;

            $employees = DB::table('users')
                ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
                ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
                ->where('user_assignments.department_id', $deptId)
                ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
                ->get();

            $totalCount = $employees->count();
            $lateCount = 0;
            $lateEmployees = [];
            $absentEmployees = [];

            foreach ($employees as $employee) {
                $firstLog = DB::table('device_logs')
                    ->where('employee_id', $employee->employee_id)
                    ->whereDate('timestamp', $date)
                    ->orderBy('timestamp')
                    ->first();

                if ($firstLog) {
                    $inTime = Carbon::parse($firstLog->timestamp)->format('H:i:s');
                    if ($inTime > '08:00:00') {
                        $lateCount++;
                        // keep employee object + in_time
                        $empWithInTime = (object) array_merge((array) $employee, ['in_time' => $inTime]);
                        $lateEmployees[] = $empWithInTime;
                    }
                } else {
                    $absentEmployees[] = $employee;
                }
            }

            $summaryTable[] = [
                'department' => $departmentName,
                'total' => $totalCount,
                'late' => $lateCount,
                'absent' => count($absentEmployees),
            ];

            if (!empty($lateEmployees)) {
                // transform to arrays for safe JSON serialization
                $lateDetails[$departmentName] = array_map(function($e) {
                    return [
                        'employee_id' => $e->employee_id,
                        'name' => $e->name,
                        'designation' => $e->designation,
                        'in_time' => $e->in_time ?? null,
                    ];
                }, $lateEmployees);
            }

            if (!empty($absentEmployees)) {
                $absentDetails[$departmentName] = array_map(function($e) {
                    return [
                        'employee_id' => $e->employee_id,
                        'name' => $e->name,
                        'designation' => $e->designation,
                    ];
                }, $absentEmployees);
            }
        }

        // Return data as Inertia props to the TSX page
        return Inertia::render('LateSummaryReport', [
            'summaryTable' => $summaryTable,
            'lateDetails' => $lateDetails,
            'absentDetails' => $absentDetails,
            'date' => $date,
        ]);
    }


    /*public function deviceLogs()
    {
        $zk = new ZKTeco('192.168.1.201', 4370); // replace with your device IP

        if (! $zk->connect()) {
            return response()->view('attendance.device', ['logs' => [], 'error' => 'Device not connected.']);
        }

        $zk->disableDevice();
        $rawLogs = $zk->getAttendance();
        $zk->enableDevice();
        $zk->disconnect();

        $groupedLogs = collect($rawLogs)
            ->groupBy(function ($log) {
                return $log['id'] . '_' . date('Y-m-d', strtotime($log['timestamp']));
            })
            ->map(function ($logs, $key) {
                $sorted = $logs->sortBy('timestamp');
                $first = $sorted->first();
                $last = $sorted->last();
                return [
                    'employee_id' => $first['id'],
                    'date' => date('Y-m-d', strtotime($first['timestamp'])),
                    'in_time' => date('H:i:s', strtotime($first['timestamp'])),
                    'out_time' => date('H:i:s', strtotime($last['timestamp'])),
                ];
            })
            ->values();

        return view('attendance.device', ['logs' => $groupedLogs, 'error' => null]);
    }*/

    /*public function deviceLogs()
    {
        $zk = new ZKTeco('192.168.10.21', 4370); // replace with your device IP

        if (! $zk->connect()) {
            return response()->view('attendance.device', ['logs' => [], 'error' => 'Device not connected.']);
        }

        $zk->disableDevice();
        $logs = $zk->getAttendance();
        $zk->enableDevice();
        $zk->disconnect();

        return view('attendance.device', ['logs' => $logs, 'error' => null]);
    }*/

    public function employeeList()
    {
        require_once app_path('Libraries/zklib/zklib.php');

        $zk = new \ZKLib('192.168.10.21', 4370);
        $zk->connect();
        $zk->disableDevice();

        $rawUsers = $zk->getUser();
        $zk->enableDevice();
        $zk->disconnect();

        $users = [];

        foreach ($rawUsers as $user) {
            $users[] = [
                'employee_id' => $user[0],
                'name' => $user[1],
                'password' => trim($user[2]),
                'device_index' => $user[3],
                'role' => match($user[4]) {
                    0 => 'User',
                    2 => 'Enroller',
                    12 => 'Manager',
                    14 => 'Super Manager',
                    default => 'Unknown',
                },
                'card_info' => $user[5],
            ];
        }

        return Inertia::render('attendance/allEmployeeAttendance', [
            'users' => $users,
        ]);
    }

    public function todayEntryList()
    {
        require_once app_path('Libraries/zklib/zklib.php');

        $zk = new \ZKLib('192.168.10.21', 4370);
        $zk->connect();
        $zk->disableDevice();

        $rawUsers = $zk->getUser();
        $logs = $zk->getAttendance(); // Full logs
        $zk->enableDevice();
        $zk->disconnect();

        $today = now()->toDateString();
        $entries = [];

        // Prepare name map
        $userMap = [];
        foreach ($rawUsers as $user) {
            $userMap[$user[0]] = $user[1]; // [employee_id => name]
        }

        // Only collect first entry of today per user
        foreach ($logs as $log) {
            $empId = $log[1];
            $timestamp = \Carbon\Carbon::parse($log[3]);

            if ($timestamp->toDateString() === $today) {
                // if not set or new time is earlier, store it
                if (!isset($entries[$empId]) || $timestamp->lessThan($entries[$empId])) {
                    $entries[$empId] = $timestamp;
                }
            }
        }

        // Format for frontend
        $entryList = [];
        foreach ($entries as $empId => $time) {
            $entryList[] = [
                'employee_id' => $empId,
                'name' => $userMap[$empId] ?? 'Unknown',
                'entry_time' => $time->toTimeString(),
            ];
        }

        return Inertia::render('attendance/todayEntryList', [
            'entries' => $entryList,
            'date' => $today,
        ]);
    }


    /*public function employeeList()
    {
        require_once app_path('Libraries/zklib/zklib.php');

        $zk = new \ZKLib('192.168.10.20', 4370);
        $zk->connect();
        $zk->disableDevice();

        $rawUsers = $zk->getUser();       // Get all users from device
        $logs = $zk->getAttendance();     // Get all logs from device

        $zk->enableDevice();
        $zk->disconnect();

        $today = now()->toDateString();
        $userMap = [];

        // Create a map of empId => name (only from device)
        foreach ($rawUsers as $user) {
            $userMap[$user[0]] = $user[1];
        }

        // Group by employee_id for first entry of today
        $entries = [];

        foreach ($logs as $log) {
            $empId = $log[1];
            $timestamp = Carbon::parse($log[3]);

            if ($timestamp->toDateString() === $today) {
                if (!isset($entries[$empId])) {
                    $entries[$empId] = [
                        'employee_id' => $empId,
                        'name' => $userMap[$empId] ?? 'Unknown',
                        'entry_time' => $timestamp->toTimeString(),
                    ];
                } else {
                    $existingTime = Carbon::parse($entries[$empId]['entry_time']);
                    if ($timestamp->lessThan($existingTime)) {
                        $entries[$empId]['entry_time'] = $timestamp->toTimeString();
                    }
                }
            }
        }

        return Inertia::render('attendance/allEmployeeAttendance', [
            'todayEntries' => array_values($entries),
        ]);
    }*/
    public function getUserAttendance($employeeId)
    {
        require_once app_path('Libraries/zklib/zklib.php');

        $zk = new \ZKLib('192.168.10.20', 4370);
        $zk->connect();
        $zk->disableDevice();

        $logs = $zk->getAttendance(); // full logs
        $zk->enableDevice();
        $zk->disconnect();

        $filtered = array_filter($logs, function ($log) use ($employeeId) {
            return $log[1] === $employeeId; // match user ID
        });

        $grouped = [];

        foreach ($filtered as $log) {
            $datetime = Carbon::parse($log[3]); // log[3] is timestamp
            $date = $datetime->toDateString();
            $grouped[$date][] = $datetime;
        }

        $officeStart = Carbon::createFromTime(8, 0, 0);
        $officeEnd = Carbon::createFromTime(14, 30, 0);

        $today = now();
        $days = [];
        $absentCount = 0;
        $lateCount = 0;
        $earlyExitCount = 0;

        for ($i = 0; $i < 2; $i++) {
            $date = $today->copy()->subDays($i)->toDateString();
            $entries = $grouped[$date] ?? [];

            if (count($entries) === 0) {
                $absentCount++;
                $days[] = [
                    'date' => $date,
                    'entry' => null,
                    'exit' => null,
                ];
                continue;
            }

            usort($entries, fn($a, $b) => $a->timestamp - $b->timestamp);
            $entryTime = $entries[0];
            $exitTime = end($entries);

            if ($entryTime->greaterThan($officeStart)) $lateCount++;
            if ($exitTime->lessThan($officeEnd)) $earlyExitCount++;

            $days[] = [
                'date' => $date,
                'entry' => $entryTime->toTimeString(),
                'exit' => $exitTime->toTimeString(),
            ];
        }

        // Optionally get name:
        $users = $zk->getUser();
        $name = collect($users)->firstWhere(0, $employeeId)[1] ?? 'Unknown';

        return response()->json([
            'name' => $name,
            'days' => array_reverse($days),
            'absent' => $absentCount,
            'late' => $lateCount,
            'early_exit' => $earlyExitCount,
        ]);
    }

    public function syncRawLogs()
    {
        $deviceIps = ['192.168.10.20', '192.168.10.21', '192.168.10.22'];
        $allLogs = collect();

        foreach ($deviceIps as $ip) {
            $zk = new \Rats\Zkteco\Lib\ZKTeco($ip);

            if (! $zk->connect()) {
                continue; // Skip unreachable device
            }

            $zk->disableDevice();
            $logs = $zk->getAttendance(); // Fetch logs

            // Store logs in memory first
            foreach ($logs as $log) {
                $allLogs->push([
                    'employee_id' => $log['id'],
                    'timestamp'   => $log['timestamp'],
                    'uid'         => $log['uid'],
                    'type'        => $log['type'],
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }

//            $zk->clearAttendance(); // 🔥 DELETE logs from device
            $zk->enableDevice();
            $zk->disconnect();
        }

        // Store logs in the database
        foreach ($allLogs as $log) {
            DeviceLog::updateOrCreate(
                ['employee_id' => $log['employee_id'], 'timestamp' => $log['timestamp']],
                $log
            );
        }

        return back()->with('success', 'Logs synced and cleared from devices.');
    }

    //IMPORTANT SECTION
/*    public function departments()
    {
        $departments = Department::all();

        return inertia('Departments/deptList', [
            'departments' => $departments,
        ]);
    }*/

    public function departments0()
    {
        $departments = Department::all();

        // last 7 working days excluding Friday (5) & Saturday (6)
        $dates = collect();
        $today = now();
        $startDate = now()->subDays(14); // to ensure we get 7 working days even with weekends

        for ($date = $startDate->copy(); $date <= $today; $date->addDay()) {
            $dayOfWeek = $date->dayOfWeekIso;
            if (!in_array($dayOfWeek, [5, 6])) {
                $dates->push($date->toDateString());
            }
        }
        $dates = $dates->take(-7); // only last 7 working days

        $deptSummaries = [];

        foreach ($departments as $dept) {
            $summary = [];

            // === Today's summary ===
            $todayDate = now()->toDateString();
            $employees = DB::table('users')
                ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
                ->where('user_assignments.department_id', $dept->id)
                ->pluck('users.employee_id');

            $totalEmp = $employees->count();
            $absent = 0;
            $late = 0;

            foreach ($employees as $empId) {
                $log = DB::table('device_logs')
                    ->where('employee_id', $empId)
                    ->whereDate('timestamp', $todayDate)
                    ->orderBy('timestamp')
                    ->pluck('timestamp');

                if ($log->isEmpty()) {
                    $absent++;
                } else {
                    $inTime = \Carbon\Carbon::parse($log->first())->format('H:i:s');
                    if ($inTime > '08:00:00') {
                        $late++;
                    }
                }
            }

            $todaySummary = [
                'total' => $totalEmp,
                'late' => $late,
                'absent' => $absent,
            ];

            // === Last 7 working days chart data ===
            foreach ($dates as $date) {
                $absentCount = 0;
                $lateCount = 0;

                foreach ($employees as $empId) {
                    $log = DB::table('device_logs')
                        ->where('employee_id', $empId)
                        ->whereDate('timestamp', $date)
                        ->orderBy('timestamp')
                        ->pluck('timestamp');

                    if ($log->isEmpty()) {
                        $absentCount++;
                    } else {
                        $inTime = \Carbon\Carbon::parse($log->first())->format('H:i:s');
                        if ($inTime > '08:00:00') {
                            $lateCount++;
                        }
                    }
                }

                $summary[] = [
                    'date'   => $date,
                    'absent' => $absentCount,
                    'late'   => $lateCount,
                ];
            }

            $deptSummaries[$dept->id] = [
                'today' => $todaySummary,
                'graph' => $summary,
            ];
        }


        return inertia('Departments/deptList', [
            'departments' => $departments,
            'attendance' => $deptSummaries,
        ]);
    }

    public function departments()
    {
        $departments = Department::all();

        // === Determine last 7 working days ===
        $dates = collect();
        $today = now()->toDateString();
        $cursor = now()->copy();

        while ($dates->count() < 7) {
            $cursor->subDay();
            $dow = $cursor->dayOfWeekIso;

            // Exclude Fri(5) & Sat(6)
            if (!in_array($dow, [5, 6])) {
                $dates->push($cursor->toDateString());
            }
        }

        $dates = $dates->sort()->values(); // ascending order

        // === Build Department Summaries ===
        $deptSummaries = [];

        foreach ($departments as $dept) {

            // Employees in this department
            $employees = DB::table('users')
                ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
                ->where('user_assignments.department_id', $dept->id)
                ->pluck('users.employee_id');

            $totalEmployees = $employees->count();

            // === TODAY SUMMARY (using DailyAttendance model) ===
            $todayLogs = DailyAttendance::whereIn('employee_id', $employees)
                ->where('date', $today)
                ->get();

            $lateToday = $todayLogs->filter(fn($log) => str_contains($log->status, 'late entry'))->count();
            $presentToday = $todayLogs->count();
            $absentToday = $totalEmployees - $presentToday;

            $todaySummary = [
                'total'  => $totalEmployees,
                'late'   => $lateToday,
                'absent' => $absentToday,
            ];

            // === LAST 7 WORKING DAYS SUMMARY ===
            $graph = [];

            foreach ($dates as $d) {
                $logs = DailyAttendance::whereIn('employee_id', $employees)
                    ->where('date', $d)
                    ->get();

                $lateCount = $logs->filter(fn($log) => str_contains($log->status, 'late'))->count();
                $presentCount = $logs->count();
                $absentCount = $totalEmployees - $presentCount;

                $graph[] = [
                    'date'   => $d,
                    'absent' => $absentCount,
                    'late'   => $lateCount,
                ];
            }

            $deptSummaries[$dept->id] = [
                'today' => $todaySummary,
                'graph' => $graph,
            ];
        }

        return inertia('Departments/deptList', [
            'departments' => $departments,
            'attendance'  => $deptSummaries,
        ]);
    }


    public function departmentList()
    {
        $departments = Department::all();

        return inertia('Departments/deptListForMonthlyReport', [
            'departments' => $departments,
        ]);
    }



    public function show0(Request $request, $departmentId)
    {
        $user = Auth::user();
        $department = Department::findOrFail($departmentId);
        $date = $request->input('date', \Carbon\Carbon::today()->toDateString());

        // ✅ fetch employees of this department
        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $departmentId)
            ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
            ->get();

        $report = [];

        foreach ($employees as $employee) {
            $logs = DB::table('device_logs')
                ->where('employee_id', $employee->employee_id)
                ->whereDate('timestamp', $date)
                ->orderBy('timestamp')
                ->pluck('timestamp');

            $inTime = $logs->count() > 0 ? Carbon::parse($logs->first())->format('H:i:s') : '';
            $outTime = $logs->count() > 1 ? Carbon::parse($logs->last())->format('H:i:s') : '';

            $assignment = DB::table('time_assignments')
                ->where('employee_id', $employee->employee_id)
                ->first();

            $allowedEntry = $assignment?->allowed_entry; // e.g. "09:00:00"


            $report[] = [
                'employee_id' => $employee->employee_id,
                'name'        => $employee->name,
                'designation' => $employee->designation,
                'in_time'       => $inTime ?: null,   // no "Absent" string here
                'out_time'      => $outTime ?: null,
                'allowed_entry' => $allowedEntry, // <-- send to frontend
            ];
        }

        return inertia('Departments/Attendance', [
            'date'    => $date,
            'report'  => $report,
            'department' => [
                'id'   => $department->id,
                'name' => $department->dept_name,
            ],
        ]);
    }

    public function show(Request $request, $departmentId)
    {
        $user = Auth::user();
        $department = Department::findOrFail($departmentId);
//        $date = $request->input('date', \Carbon\Carbon::today()->toDateString());
//        $departmentId   = $department->department_id;
        $departmentName = $department->dept_name;

        $date = $request->input('date', \Carbon\Carbon::today()->toDateString());

        // 2️⃣ Get employees of this department
        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $departmentId)
            ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
            ->get();

        // 3️⃣ Build report USING DailyAttendance table
        $report = [];

        foreach ($employees as $emp) {
            $attendance = DailyAttendance::where('employee_id', $emp->employee_id)
                ->where('date', $date)
                ->first();

            $report[] = [
                'employee_id' => $emp->employee_id,
                'name'        => $emp->name,
                'designation' => $emp->designation,
                'in_time'     => $attendance?->in_time ?? null,
                'out_time'    => $attendance?->out_time ?? null,
                'status'      => $attendance?->status ?? null,   // 👈 USING DB STATUS
            ];
        }

        return inertia('Departments/Attendance', [
            'date'       => $date,
            'department' => ['id' => $departmentId, 'name' => $departmentName],
            'report'     => $report,
        ]);
    }

    // app/Http/Controllers/DeptHeadAttendanceController.php
    public function deptEmployee(Request $request, $employeeId)
    {
        /*$user = Auth::user();

        // ✅ verify dept head
        $deptHead = DB::table('dept_heads')->where('employee_id', $user->employee_id)->first();
        if (!$deptHead) {
            abort(403, 'Not authorized');
        }*/

        // ✅ check that the employee belongs to their department
        /*$belongs = DB::table('user_assignments')
            ->where('employee_id', $employeeId)
            ->where('department_id', $deptHead->department_id)
            ->exists();

        if (!$belongs) {
            abort(403, 'Employee not in your department');
        }*/

        // --- Same logic as dashboard
        $month = (int) $request->input('month', now()->month);
        $year  = (int) $request->input('year', now()->year);
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end   = Carbon::create($year, $month, 1)->endOfMonth();
        $today = Carbon::today();

        // per-day punches
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

        // Holidays (reuse your same list)
        $holidayDates = collect([
            '2025-02-15','2025-02-21','2025-03-26','2025-03-28',
            '2025-03-29','2025-03-30','2025-03-31','2025-04-01','2025-04-02','2025-04-03',
            '2025-04-14','2025-05-01','2025-05-11',
            '2025-06-05','2025-06-06','2025-06-07','2025-06-08','2025-06-09','2025-06-10',
            '2025-07-06','2025-08-05','2025-08-16','2025-09-05','2025-10-01','2025-10-02',
            '2025-12-16','2025-12-25',
        ])->map(fn($d) => Carbon::parse($d)->toDateString());

        $holidayNames = collect([
            '2025-08-16' => 'Janmashtami',
        ]);

        // build logs
        $calendarLogs = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $dateStr   = $d->toDateString();
            $hasPunch  = array_key_exists($dateStr, $byDate);
            $isHoliday = $holidayDates->contains($dateStr);
            $isWeekend = in_array($d->dayOfWeek, [5, 6]);
            $isFuture  = $d->gt($today);

            $label = $isHoliday ? ($holidayNames[$dateStr] ?? 'Holiday') : ($isWeekend ? 'Weekend' : null);

            if ($hasPunch) {
                $status = $isHoliday ? 'holiday' : ($isWeekend ? 'weekend' : 'present');
                $calendarLogs[] = [
                    'date'     => $dateStr,
                    'in_time'  => $byDate[$dateStr]['in_time'],
                    'out_time' => $byDate[$dateStr]['out_time'],
                    'status'   => $status,
                    'label'    => $label,
                ];
            } elseif ($isHoliday) {
                $calendarLogs[] = ['date'=>$dateStr,'in_time'=>null,'out_time'=>null,'status'=>'holiday','label'=>$label];
            } elseif ($isWeekend) {
                $calendarLogs[] = ['date'=>$dateStr,'in_time'=>null,'out_time'=>null,'status'=>'weekend','label'=>$label];
            } elseif ($isFuture) {
                $calendarLogs[] = ['date'=>$dateStr,'in_time'=>null,'out_time'=>null,'status'=>'future','label'=>null];
            } else {
                $calendarLogs[] = ['date'=>$dateStr,'in_time'=>null,'out_time'=>null,'status'=>'absent','label'=>null];
            }
        }

        // summary
        $absence = 0; $late = 0; $early = 0;
        foreach ($calendarLogs as $row) {
            if ($row['status'] === 'absent') $absence++;
            elseif ($row['status'] === 'present') {
                if ($row['in_time']  && $row['in_time']  > '08:00') $late++;
                if ($row['out_time'] && $row['out_time'] < '14:30') $early++;
            }
        }
        $summary = ['absence'=>$absence,'late'=>$late,'early'=>$early];

        return response()->json([
            'calendarLogs' => $calendarLogs,
            'summary'      => $summary,
            'month'        => $month,
            'year'         => $year,
        ]);
    }

    public function monthlyReport0($deptId)
    {
        // Auto detect current month
        $today = now();
        $startDate = $today->copy()->startOfMonth();
        $endDate   = $today->copy(); // till today

        // Collect working days (excluding Fri & Sat)
        $dates = collect();
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dayOfWeek = $date->dayOfWeekIso;
            if (!in_array($dayOfWeek, [5, 6])) {
                $dates->push($date->toDateString());
            }
        }

        // Department info
        $department = DB::table('departments')->find($deptId);

        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $deptId)
            ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
            ->get();

        $report = [];

        foreach ($employees as $employee) {
            $present = 0;
            $late = 0;
            $earlyLeave = 0;

            foreach ($dates as $date) {
                $logs = DB::table('device_logs')
                    ->where('employee_id', $employee->employee_id)
                    ->whereDate('timestamp', $date)
                    ->orderBy('timestamp')
                    ->pluck('timestamp');

                if ($logs->isNotEmpty()) {
                    $present++;

                    $firstLog = Carbon::parse($logs->first())->format('H:i:s');
                    $lastLog  = Carbon::parse($logs->last())->format('H:i:s');

                    if ($firstLog > '08:00:00') {
                        $late++;
                    }

                    if ($lastLog < '14:30:00') {
                        $earlyLeave++;
                    }
                }
            }

            $totalWorkdays = $dates->count();
            $absent = $totalWorkdays - $present;

            $report[] = [
                'name'        => $employee->name,
                'id'        => $employee->employee_id,
                'designation' => $employee->designation,
                'total_days'  => $totalWorkdays,
                'present'     => $present,
                'absent'      => $absent,
                'late'        => $late,
                'early_leave' => $earlyLeave,
            ];
        }

        return inertia('Departments/MonthlyReport', [
            'report'      => $report,
            'department'  => $department,
            'monthName'   => $today->format('F Y'), // e.g. "September 2025"
        ]);
    }

    public function monthlyReport1($deptId)
    {
        $today = now();
        $startDate = $today->copy()->startOfMonth();
        $endDate = $today->copy()->subDay();

        // Collect working days (Mon–Thu, Sun) only
        $dates = collect();
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dayOfWeek = $date->dayOfWeekIso; // 1=Mon … 7=Sun
            if (!in_array($dayOfWeek, [5, 6])) { // Exclude Fri(5) & Sat(6)
                $dates->push($date->toDateString());
            }
        }

        $department = DB::table('departments')->find($deptId);

        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $deptId)
            ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
            ->get();

        $report = [];

        foreach ($employees as $employee) {
            $present = 0;
            $late = 0;
            $earlyLeave = 0;
            $overtimeDays = 0;
            $totalOvertimeMinutes = 0;

            foreach ($dates as $date) {
                $logs = DB::table('device_logs')
                    ->where('employee_id', $employee->employee_id)
                    ->whereDate('timestamp', $date)
                    ->orderBy('timestamp')
                    ->pluck('timestamp');

                if ($logs->isNotEmpty()) {
                    $present++;

                    $firstLog = Carbon::parse($logs->first());
                    $lastLog  = Carbon::parse($logs->last());

                    // Late if after 08:00
                    if ($firstLog->gt(Carbon::parse($date . ' 08:00:00'))) {
                        $late++;
                    }

                    // Early leave if before 14:30
                    if ($lastLog->lt(Carbon::parse($date . ' 14:30:00'))) {
                        $earlyLeave++;
                    }

                    // Work duration
                    $workedMinutes = $lastLog->diffInMinutes($firstLog);
                    $requiredMinutes = 6 * 60 + 30; // 390

                    if ($workedMinutes > $requiredMinutes) {
                        $overtimeDays++;
                        $totalOvertimeMinutes += ($workedMinutes - $requiredMinutes);
                    }
                }
            }

            $totalWorkdays = $dates->count();
            $absent = $totalWorkdays - $present;

/*            $overtimeHours = round($totalOvertimeMinutes / 60, 2);
            $overtimeEquivalentDays = round($overtimeHours / 6.5, 2);*/
            $overtimeHours = $totalOvertimeMinutes / 60;
            $overtimeEquivalentDays = $overtimeHours / 6.5;

            $report[] = [
                'id'                  => $employee->employee_id,
                'name'                => $employee->name,
                'designation'         => $employee->designation,
                'total_days'          => $totalWorkdays,
                'present'             => $present,
                'absent'              => $absent,
                'late'                => $late,
                'early_leave'         => $earlyLeave,
                'overtime_days'       => $overtimeDays,
                'overtime_hours'      => $overtimeHours,
                'overtime_equiv_days' => $overtimeEquivalentDays,
            ];
        }

        return inertia('Departments/MonthlyReport', [
            'report'      => $report,
            'department'  => $department,
            'monthName'   => $today->format('F Y'),
        ]);
    }



    public function monthlyReport($deptId)
    {
        $today = now();
        $startDate = $today->copy()->startOfMonth();
        $endDate = $today->copy()->subDay(); // up to yesterday

        // --- 1️⃣ Get holidays for this month
        $holidayDates = Holiday::whereBetween('date', [$startDate, $endDate])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        // --- 2️⃣ Collect working days (Mon–Thu, Sun), excluding Fri(5), Sat(6), and holidays
        $dates = collect();
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dayOfWeek = $date->dayOfWeekIso; // 1=Mon … 7=Sun
            $isWeekend = in_array($dayOfWeek, [5, 6]);
            $isHoliday = in_array($date->toDateString(), $holidayDates);

            if (!$isWeekend && !$isHoliday) {
                $dates->push($date->toDateString());
            }
        }

        // --- 3️⃣ Department Info
        $department = DB::table('departments')->find($deptId);

        // --- 4️⃣ Employees of the Department
        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $deptId)
            ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
            ->get();

        $report = [];

        // --- 5️⃣ For each employee
        foreach ($employees as $employee) {
            $present = 0;
            $late = 0;
            $earlyLeave = 0;
            $overtimeDays = 0;
            $totalOvertimeMinutes = 0;

            foreach ($dates as $date) {
                $logs = DB::table('device_logs')
                    ->where('employee_id', $employee->employee_id)
                    ->whereDate('timestamp', $date)
                    ->orderBy('timestamp')
                    ->pluck('timestamp');

                if ($logs->isNotEmpty()) {
                    $present++;

                    $firstLog = Carbon::parse($logs->first());
                    $lastLog  = Carbon::parse($logs->last());

                    // Late if after 08:00
                    if ($firstLog->gt(Carbon::parse("$date 08:00:00"))) {
                        $late++;
                    }

                    // Early leave if before 14:30
                    if ($lastLog->lt(Carbon::parse("$date 14:30:00"))) {
                        $earlyLeave++;
                    }

                    // Work duration
                    $workedMinutes = $lastLog->diffInMinutes($firstLog);
                    $requiredMinutes = 6 * 60 + 30; // 390 min (6.5h)

                    if ($workedMinutes > $requiredMinutes) {
                        $overtimeDays++;
                        $totalOvertimeMinutes += ($workedMinutes - $requiredMinutes);
                    }
                }
            }

            // --- 6️⃣ Absence count (holidays are already excluded from total days)
            $totalWorkdays = $dates->count();
            $absent = $totalWorkdays - $present;

            $overtimeHours = $totalOvertimeMinutes / 60;
            $overtimeEquivalentDays = $overtimeHours / 6.5;

            $report[] = [
                'id'                  => $employee->employee_id,
                'name'                => $employee->name,
                'designation'         => $employee->designation,
                'total_days'          => $totalWorkdays,
                'present'             => $present,
                'absent'              => $absent,
                'late'                => $late,
                'early_leave'         => $earlyLeave,
                'overtime_days'       => $overtimeDays,
                'overtime_hours'      => $overtimeHours,
                'overtime_equiv_days' => $overtimeEquivalentDays,
            ];
        }

        // --- 7️⃣ Send data to Inertia view
        return inertia('Departments/MonthlyReport', [
            'report'      => $report,
            'department'  => $department,
            'monthName'   => $today->format('F Y'),
            'holidays'    => $holidayDates, // optional: show holidays in UI
        ]);
    }

    public function dateRangeReport(Request $request, $deptId)
    {
        $startDate = Carbon::parse($request->input('startDate', now()->startOfMonth()));
        $endDate   = Carbon::parse($request->input('endDate', now()->subDay()));

        // --- 1️⃣ Get holidays within the range
        $holidayDates = Holiday::whereBetween('date', [$startDate, $endDate])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        // --- 2️⃣ Working days excluding Friday(5), Saturday(6), and holidays
        $dates = collect();
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dayOfWeek = $date->dayOfWeekIso;
            $isWeekend = in_array($dayOfWeek, [5, 6]);
            $isHoliday = in_array($date->toDateString(), $holidayDates);

            if (!$isWeekend && !$isHoliday) {
                $dates->push($date->toDateString());
            }
        }

        // --- 3️⃣ Department
        $department = DB::table('departments')->find($deptId);

        // --- 4️⃣ Employees
        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $deptId)
            ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
            ->get();

        $report = [];

        // --- 5️⃣ Attendance calculation
        foreach ($employees as $employee) {
            $present = $late = $earlyLeave = $overtimeDays = $totalOvertimeMinutes = 0;

            foreach ($dates as $date) {
                $logs = DB::table('device_logs')
                    ->where('employee_id', $employee->employee_id)
                    ->whereDate('timestamp', $date)
                    ->orderBy('timestamp')
                    ->pluck('timestamp');

                if ($logs->isNotEmpty()) {
                    $present++;

                    $firstLog = Carbon::parse($logs->first());
                    $lastLog  = Carbon::parse($logs->last());

                    if ($firstLog->gt(Carbon::parse("$date 08:00:00"))) $late++;
                    if ($lastLog->lt(Carbon::parse("$date 14:30:00"))) $earlyLeave++;

                    $workedMinutes = $lastLog->diffInMinutes($firstLog);
                    $requiredMinutes = 6 * 60 + 30;

                    if ($workedMinutes > $requiredMinutes) {
                        $overtimeDays++;
                        $totalOvertimeMinutes += ($workedMinutes - $requiredMinutes);
                    }
                }
            }

            $totalWorkdays = $dates->count();
            $absent = $totalWorkdays - $present;
            $overtimeHours = $totalOvertimeMinutes / 60;
            $overtimeEquivalentDays = $overtimeHours / 6.5;

            $report[] = [
                'id'                  => $employee->employee_id,
                'name'                => $employee->name,
                'designation'         => $employee->designation,
                'total_days'          => $totalWorkdays,
                'present'             => $present,
                'absent'              => $absent,
                'late'                => $late,
                'early_leave'         => $earlyLeave,
                'overtime_days'       => $overtimeDays,
                'overtime_hours'      => $overtimeHours,
                'overtime_equiv_days' => $overtimeEquivalentDays,
            ];
        }

        return inertia('Departments/MonthlyReport', [
            'report'      => $report,
            'department'  => $department,
            'monthName'   => $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y'),
            'startDate'   => $startDate->toDateString(),
            'endDate'     => $endDate->toDateString(),
        ]);
    }






}

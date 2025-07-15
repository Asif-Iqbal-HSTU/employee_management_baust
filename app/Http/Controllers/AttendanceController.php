<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use Rats\Zkteco\Lib\ZKTeco;
use Illuminate\Support\Facades\Hash;

class AttendanceController extends Controller
{
    public function syncUsersFromDevices()
    {
        $deviceIps = ['192.168.10.20'];
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
}

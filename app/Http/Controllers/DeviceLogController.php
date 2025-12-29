<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\DeviceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Services\DutyTimeResolver;
use App\Services\AttendanceStatusResolver;

class DeviceLogController extends Controller
{
    public function syncRawLogs0()
    {
//        $deviceIps = ['192.168.10.22'];
        $deviceIps = ['192.168.10.20','192.168.10.21','192.168.10.22'];
        $batchSize = 1000;

        foreach ($deviceIps as $ip) {
            $zk = new \Rats\Zkteco\Lib\ZKTeco($ip);

            if (! $zk->connect()) {
                continue; // Skip unreachable device
            }

            $zk->disableDevice();
            $logs = $zk->getAttendance(); // Fetch logs

            $batch = [];
            foreach ($logs as $log) {
                $batch[] = [
                    'employee_id' => $log['id'],
                    'timestamp'   => $log['timestamp'],
                    'uid'         => $log['uid'],
                    'type'        => $log['type'],
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];

                if (count($batch) >= $batchSize) {
                    DeviceLog::upsert(
                        $batch,
                        ['employee_id', 'timestamp'],
                        ['uid', 'type', 'updated_at']
                    );
                    $batch = [];
                }
            }

            // insert remaining
            if (!empty($batch)) {
                DeviceLog::upsert(
                    $batch,
                    ['employee_id', 'timestamp'],
                    ['uid', 'type', 'updated_at']
                );
            }

            $zk->clearAttendance();
            $zk->enableDevice();
            $zk->disconnect();
        }

        return back()->with('success', 'Logs synced and cleared from devices.');
    }

    public static function forDate($date)
    {
        return self::where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->orderBy('start_date', 'desc')
            ->first();
    }

    public function syncRawLogsOriginal()
    {
        $deviceIps = ['192.168.10.20','192.168.10.21','192.168.10.22'];
        $batchSize = 1000;

        // Store affected attendance dates as:
        // $affected[employee_id][date] = true
        $affected = [];

        foreach ($deviceIps as $ip) {

            $zk = new \Rats\Zkteco\Lib\ZKTeco($ip);

            if (!$zk->connect()) {
                continue;
            }

            $zk->disableDevice();
            $logs = $zk->getAttendance();

            $batch = [];

            foreach ($logs as $log) {

                // Convert timestamp to Y-m-d for later recalculation
                $date = Carbon::parse($log['timestamp'])->toDateString();
                $affected[$log['id']][$date] = true;

                $batch[] = [
                    'employee_id' => $log['id'],
                    'timestamp'   => Carbon::parse($log['timestamp'])->format('Y-m-d H:i:s'),
                    'uid'         => $log['uid'],
                    'type'        => $log['type'],
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];

                if (count($batch) >= $batchSize) {
                    DeviceLog::upsert(
                        $batch,
                        ['employee_id', 'timestamp'],
                        ['uid', 'type', 'updated_at']
                    );
                    $batch = [];
                }
            }

            // Insert remaining batch
            if (!empty($batch)) {
                DeviceLog::upsert(
                    $batch,
                    ['employee_id', 'timestamp'],
                    ['uid', 'type', 'updated_at']
                );
            }

            // Clear device logs
            $zk->clearAttendance();
            $zk->enableDevice();
            $zk->disconnect();
        }

        // -----------------------------------------------------------------
        // STEP 2: Process only affected (employee + date)
        // -----------------------------------------------------------------

        foreach ($affected as $empId => $days) {

            foreach ($days as $date => $_) {

                // Get the first and last punch of that employee on that date
                $row = DeviceLog::where('employee_id', $empId)
                    ->whereDate('timestamp', $date)
                    ->selectRaw('MIN(`timestamp`) as in_time, MAX(`timestamp`) as out_time')
                    ->first();

                if (!$row || !$row->in_time || !$row->out_time) {
                    continue;
                }

                // Extract HH:MM only
                $in  = Carbon::parse($row->in_time)->format('H:i');
                $out = Carbon::parse($row->out_time)->format('H:i');

                // Status calculation
                $status = [];
                if ($in > '08:30:00') $status[] = 'late entry';
                if ($out < '14:30:00') $status[] = 'early leave';

                \App\Models\DailyAttendance::updateOrCreate(
                    ['employee_id' => $empId, 'date' => $date],
                    [
                        'in_time'  => $in,
                        'out_time' => $out,
                        'status'   => $status ? implode(', ', $status) : 'ok',
                    ]
                );
            }
        }

        return back()->with('success', 'Logs synced, cleared from devices, and daily attendance updated.');
    }

    public function syncRawLogs00()
    {
        $deviceIps = ['192.168.10.20','192.168.10.21','192.168.10.22'];
        $batchSize = 1000;

        // Store affected attendance dates
        $affected = [];

        foreach ($deviceIps as $ip) {

            $zk = new \Rats\Zkteco\Lib\ZKTeco($ip);

            if (!$zk->connect()) continue;

            $zk->disableDevice();
            $logs = $zk->getAttendance();

            $batch = [];

            foreach ($logs as $log) {

                $date = Carbon::parse($log['timestamp'])->toDateString();
                $affected[$log['id']][$date] = true;

                $batch[] = [
                    'employee_id' => $log['id'],
                    'timestamp'   => Carbon::parse($log['timestamp'])->format('Y-m-d H:i:s'),
                    'uid'         => $log['uid'],
                    'type'        => $log['type'],
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];

                if (count($batch) >= $batchSize) {
                    DeviceLog::upsert(
                        $batch,
                        ['employee_id', 'timestamp'],
                        ['uid', 'type', 'updated_at']
                    );
                    $batch = [];
                }
            }

            // Insert last batch
            if (!empty($batch)) {
                DeviceLog::upsert(
                    $batch,
                    ['employee_id', 'timestamp'],
                    ['uid', 'type', 'updated_at']
                );
            }

            $zk->clearAttendance();
            $zk->enableDevice();
            $zk->disconnect();
        }

        // -------------------------------------------------------------
        // STEP 2: Recalculate daily attendance using OfficeTime table
        // -------------------------------------------------------------

        foreach ($affected as $empId => $days) {

            foreach ($days as $date => $_) {

                $row = DeviceLog::where('employee_id', $empId)
                    ->whereDate('timestamp', $date)
                    ->selectRaw('MIN(`timestamp`) as in_time, MAX(`timestamp`) as out_time')
                    ->first();

                if (!$row || !$row->in_time || !$row->out_time) continue;

                $in  = Carbon::parse($row->in_time)->format('H:i');
                $out = Carbon::parse($row->out_time)->format('H:i');

                // -------------------------------------
                // Fetch office rule for this date
                // -------------------------------------
                $rule = \App\Models\OfficeTime::whereDate('start_date', '<=', $date)
                    ->whereDate('end_date', '>=', $date)
                    ->first();


                /*$officeIn  = $rule?->in_time ?? '08:00:00';
                $officeOut = $rule?->out_time ?? '14:30:00';

                // -------------------------------------
                // Status calculation using dynamic rules
                // -------------------------------------
                $status = [];

                if ($in > $officeIn) {
                    $status[] = 'late entry';
                }

                if ($out < $officeOut) {
                    $status[] = 'early leave';
                }

                DailyAttendance::updateOrCreate(
                    ['employee_id' => $empId, 'date' => $date],
                    [
                        'in_time'  => $in,
                        'out_time' => $out,
                        'status'   => $status ? implode(', ', $status) : 'ok',
                    ]
                );*/

                $timing = DutyTimeResolver::resolve($empId, $date);

                $status = AttendanceStatusResolver::resolve(
                    $in,
                    $out,
                    $timing['start'],
                    $timing['end']
                );

                DailyAttendance::updateOrCreate(
                    ['employee_id' => $empId, 'date' => $date],
                    [
                        'in_time'  => $in,
                        'out_time' => $out,
                        'status'   => $status,
                        'remarks'  => $timing['source'], // office / roster
                    ]
                );

            }
        }

        return back()->with('success', 'Logs synced, cleared from devices, and daily attendance updated.');
    }

    public function syncRawLogs()
    {
        $deviceIps = ['192.168.10.20','192.168.10.21','192.168.10.22'];
        $batchSize = 1000;
        $affected = [];

        foreach ($deviceIps as $ip) {

            $zk = new \Rats\Zkteco\Lib\ZKTeco($ip);
            if (!$zk->connect()) continue;

            $zk->disableDevice();
            $logs = $zk->getAttendance();
            $batch = [];

            foreach ($logs as $log) {

                $date = Carbon::parse($log['timestamp'])->toDateString();
                $affected[$log['id']][$date] = true;

                $batch[] = [
                    'employee_id' => $log['id'],
                    'timestamp'   => Carbon::parse($log['timestamp'])->format('Y-m-d H:i:s'),
                    'uid'         => $log['uid'],
                    'type'        => $log['type'],
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];

                if (count($batch) >= $batchSize) {
                    DeviceLog::upsert(
                        $batch,
                        ['employee_id', 'timestamp'],
                        ['uid', 'type', 'updated_at']
                    );
                    $batch = [];
                }
            }

            if ($batch) {
                DeviceLog::upsert(
                    $batch,
                    ['employee_id', 'timestamp'],
                    ['uid', 'type', 'updated_at']
                );
            }

            $zk->clearAttendance();
            $zk->enableDevice();
            $zk->disconnect();
        }

        // 🔁 Recalculate daily attendance
        foreach ($affected as $empId => $days) {
            foreach ($days as $date => $_) {

                $row = DeviceLog::where('employee_id', $empId)
                    ->whereDate('timestamp', $date)
                    ->selectRaw('MIN(timestamp) as in_time, MAX(timestamp) as out_time')
                    ->first();

                if (!$row) continue;

                $in  = $row->in_time  ? Carbon::parse($row->in_time)->format('H:i:s') : null;
                $out = $row->out_time ? Carbon::parse($row->out_time)->format('H:i:s') : null;

                // 🔑 unified expected time
                $timing = DutyTimeResolver::resolve($empId, $date);

                $status = AttendanceStatusResolver::resolve(
                    $in,
                    $out,
                    $timing['start'],
                    $timing['end']
                );

                DailyAttendance::updateOrCreate(
                    ['employee_id' => $empId, 'date' => $date],
                    [
                        'in_time'  => $in,
                        'out_time' => $out,
                        'status'   => $status,
//                        'remarks'  => $timing['source'], // roster / office / default
                    ]
                );
            }
        }

        return back()->with('success', 'Logs synced and attendance recalculated correctly.');
    }


    public function generateReport(Request $request)
    {
        $date = $request->input('date', today()->toDateString());

        $logs = DB::table('device_logs as dl')
            ->select(
                'dl.employee_id',
                'users.name',
                'departments.dept_name as department',
                'designations.designation_name as designation',
                DB::raw("MIN(DATE_FORMAT(dl.timestamp, '%H:%i:%s')) as in_time"),
                DB::raw("MAX(DATE_FORMAT(dl.timestamp, '%H:%i:%s')) as out_time")
            )
            ->join('users', 'users.employee_id', '=', 'dl.employee_id')
            ->leftJoin('user_assignments', 'user_assignments.employee_id', '=', 'users.employee_id')
            ->leftJoin('departments', 'departments.id', '=', 'user_assignments.department_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->whereDate('dl.timestamp', $date)
            ->groupBy(
                'dl.employee_id',
                'users.name',
                'departments.dept_name',
                'designations.designation_name'
            )
            ->orderBy('dl.employee_id')
            ->get();


        return view('attendance.report', compact('logs', 'date'));
    }

    public function getLastSyncTime()
    {
        $lastLog = \App\Models\DeviceLog::latest('created_at')->first();

        return response()->json([
            'last_synced' => $lastLog ? $lastLog->created_at->format('Y-m-d H:i:s') : null
        ]);
    }

}

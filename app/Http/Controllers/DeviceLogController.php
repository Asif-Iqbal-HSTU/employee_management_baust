<?php

namespace App\Http\Controllers;

use App\Models\DeviceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceLogController extends Controller
{
    public function syncRawLogs()
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




    /*public function syncRawLogs()
   {
       $deviceIps = ['192.168.10.20'];
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

           //$zk->clearAttendance(); // 🔥 DELETE logs from device
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
   }*/

    /*public function syncRawLogs()
    {
        $deviceIps = ['192.168.10.20', '192.168.10.21', '192.168.10.22'];
        $allLogs = collect();

        foreach ($deviceIps as $ip) {
            $zk = new \Rats\Zkteco\Lib\ZKTeco($ip);

            if (! $zk->connect()) {
                continue;
            }

            $zk->disableDevice();
            $logs = $zk->getAttendance();

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

            // Optional: clear after fetch
            // $zk->clearAttendance();
            $zk->enableDevice();
            $zk->disconnect();
        }

        // Remove duplicates from collection before inserting
        $allLogs = $allLogs->unique(fn($log) => $log['employee_id'].'-'.$log['timestamp']);

        // Insert in chunks
        foreach ($allLogs->chunk(1000) as $chunk) {
            DeviceLog::insert($chunk->toArray());
        }

        return back()->with('success', 'Logs synced and cleared from devices.');
    }*/

    /*public function syncRawLogs()
    {
        $zk = new \Rats\Zkteco\Lib\ZKTeco('192.168.10.21', 4370); // change IP

        if (! $zk->connect()) {
            return back()->with('error', 'Failed to connect to device.');
        }

        $zk->disableDevice();
        $logs = $zk->getAttendance();
        $zk->enableDevice();
        $zk->disconnect();

        foreach ($logs as $log) {
            DeviceLog::updateOrCreate(
                [
                    'employee_id' => $log['id'],
                    'timestamp' => $log['timestamp']
                ],
                [
                    'uid' => $log['uid'],
                    'type' => $log['type']
                ]
            );
        }

        return back()->with('success', 'Logs synced to database.');
    }*/

    public function generateReport(Request $request)
    {
        $date = $request->input('date', today()->toDateString());

        /*$logs = DB::table('device_logs as dl')
//            ->select('dl.employee_id', 'users.name', 'departments.name as department',
            ->select('dl.employee_id', 'users.name',
                DB::raw("MIN(DATE_FORMAT(dl.timestamp, '%H:%i:%s')) as in_time"),
                DB::raw("MAX(DATE_FORMAT(dl.timestamp, '%H:%i:%s')) as out_time"))
            ->join('users', 'users.employee_id', '=', 'dl.employee_id')
//            ->leftJoin('departments', 'users.department_id', '=', 'departments.id')
            ->whereDate('dl.timestamp', $date)
//            ->groupBy('dl.employee_id', 'users.name', 'departments.name')
            ->groupBy('dl.employee_id', 'users.name')
            ->orderBy('dl.employee_id')
            ->get();*/

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

<?php

namespace App\Http\Controllers;

use App\Models\DeviceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceLogController extends Controller
{
    public function syncRawLogs()
    {
        $deviceIps = ['192.168.10.21'];
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

            $zk->clearAttendance(); // 🔥 DELETE logs from device
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

        $logs = DB::table('device_logs as dl')
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
            ->get();

        return view('attendance.report', compact('logs', 'date'));
    }

}

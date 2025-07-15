<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ZKTecoController extends Controller
{
    public function getLogs()
    {
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', 300);
        set_time_limit(300);

        require_once app_path('Libraries/zklib/zklib.php');

        $zk = new \zklib('192.168.10.21', 4370);
        $zk->connect();
        $zk->disableDevice();

        $logs = $zk->getAttendance();
        $zk->enableDevice();
        $zk->disconnect();

        // Insert only non-duplicate logs
        $chunks = array_chunk($logs, 100);
        $inserted = 0;

        foreach ($chunks as $chunk) {
            $filtered = [];

            foreach ($chunk as $log) {
                $exists = DB::table('attendances')
                    ->where('uid', $log['uid'])
                    ->where('employee_id', $log['id'])
                    ->where('timestamp', $log['timestamp'])
                    ->exists();

                if (!$exists) {
                    $filtered[] = [
                        'uid' => $log['uid'],
                        'employee_id' => $log['id'],
                        'timestamp' => $log['timestamp'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            if (!empty($filtered)) {
                DB::table('attendances')->insert($filtered);
                $inserted += count($filtered);
            }
        }

        return response()->json([
            'message' => 'Logs fetched and stored (deduplicated) successfully',
            'total_fetched' => count($logs),
            'new_inserted' => $inserted,
        ]);
    }

    public function getUsers(){
        require_once app_path('Libraries/zklib/zklib.php');

        $zk = new \zklib('192.168.10.20', 4370);
        $zk->connect();
        $zk->disableDevice();
        $users = $zk->getUser();
        $count = count($users);
        $zk->enableDevice();
        $zk->disconnect();

        dd("Total registered users: $count", $users);
    }
}

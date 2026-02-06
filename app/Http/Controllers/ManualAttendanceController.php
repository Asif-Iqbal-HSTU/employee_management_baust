<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\DeviceLog;
use App\Models\User;
use App\Services\AttendanceStatusResolver;
use App\Services\DutyTimeResolver;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManualAttendanceController extends Controller
{
    public function index()
    {
        return Inertia::render('attendance/ManualEntry');
    }

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required',
            'date' => 'required|date',
        ]);

        $query = $request->input('query');
        $date = $request->date;

        // Search for user by employee_id or name
        $users = User::where('employee_id', $query)
            ->orWhere('name', 'like', "%{$query}%")
            ->get(['employee_id', 'name']);

        if ($users->isEmpty()) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        if ($users->count() > 1) {
            return response()->json([
                'multiple' => true,
                'users' => $users
            ]);
        }

        $user = $users->first();
        $employeeId = $user->employee_id;

        $attendance = DailyAttendance::where('employee_id', $employeeId)
            ->where('date', $date)
            ->first();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'employee_id' => $user->employee_id,
            ],
            'attendance' => $attendance,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required',
            'date' => 'required|date',
            'in_time' => 'nullable',
            'out_time' => 'nullable',
            'status' => 'nullable',
            'remarks' => 'nullable',
        ]);

        $employeeId = $request->employee_id;
        $date = $request->date;
        $inTime = $request->in_time;
        $outTime = $request->out_time;
        $remarks = $request->remarks;

        DB::beginTransaction();
        try {
            // 1. Handle Device Logs
            // We'll remove existing "MANUAL" logs for this day/employee and add new ones if provided
            // Or just add new ones. To keep it simple and clean for associated tables, 
            // if we are editing, we might want to reconcile.
            
            // For now, let's just make sure there are logs covering these times.
            if ($inTime) {
                $inTimestamp = Carbon::parse($date . ' ' . $inTime)->toDateTimeString();
                DeviceLog::updateOrCreate(
                    [
                        'employee_id' => $employeeId,
                        'timestamp' => $inTimestamp,
                    ],
                    [
                        'type' => 0, // Manual/Standard
                        'uid' => 0,  // Manual
                    ]
                );
            }

            if ($outTime) {
                $outTimestamp = Carbon::parse($date . ' ' . $outTime)->toDateTimeString();
                DeviceLog::updateOrCreate(
                    [
                        'employee_id' => $employeeId,
                        'timestamp' => $outTimestamp,
                    ],
                    [
                        'type' => 0, // Manual/Standard
                        'uid' => 0,  // Manual
                    ]
                );
            }

            // 2. Resolve Status if not provided
            $timing = DutyTimeResolver::resolve($employeeId, $date);
            $status = $request->status;
            
            if (!$status) {
                $status = AttendanceStatusResolver::resolve(
                    $inTime,
                    $outTime,
                    $timing['start'],
                    $timing['end'],
                    $timing['is_overnight']
                );
            }

            // 3. Update Daily Attendance
            $attendance = DailyAttendance::updateOrCreate(
                [
                    'employee_id' => $employeeId,
                    'date' => $date,
                ],
                [
                    'in_time' => $inTime,
                    'out_time' => $outTime,
                    'status' => $status,
                    'remarks' => $remarks,
                ]
            );

            DB::commit();
            return response()->json([
                'message' => 'Attendance saved successfully',
                'attendance' => $attendance
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save attendance: ' . $e->getMessage()], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeptHeadAttendanceController extends Controller
{
    public function index0(Request $request)
    {
        $user = Auth::user();

        $deptHead = DB::table('dept_heads')
            ->join('departments', 'dept_heads.department_id', '=', 'departments.id')
            ->where('dept_heads.employee_id', $user->employee_id)
            ->select('dept_heads.*', 'departments.dept_name')
            ->first();

        if (!$deptHead) {
            abort(403, 'You are not a department head');
        }

        $departmentId   = $deptHead->department_id;
        $departmentName = $deptHead->dept_name;

        $date = $request->input('date', Carbon::today()->toDateString());

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

        return inertia('DeptHead/Attendance', [
            'date'       => $date,
            'department' => [
                'id'   => $departmentId,
                'name' => $departmentName,
            ],
            'report'     => $report,
        ]);
    }

    public function index(Request $request)
    {
        $user = Auth::user();

//        dd($user);

        // --- 1️⃣ Check if user is department head ---
        $deptHead = DB::table('dept_heads')
            ->join('departments', 'dept_heads.department_id', '=', 'departments.id')
            ->where('dept_heads.employee_id', $user->employee_id)
            ->select('dept_heads.*', 'departments.dept_name')
            ->first();

        if (!$deptHead) {
            abort(403, 'You are not a department head');
        }

        $departmentId   = $deptHead->department_id;
        $departmentName = $deptHead->dept_name;

        $date = $request->input('date', Carbon::today()->toDateString());

        // --- 2️⃣ Get employees of this department ---
        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $departmentId)
            ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
            ->get();

        $report = [];

        foreach ($employees as $employee) {

            // --- 3️⃣ Fetch DailyAttendance record ---
            $attendance = \App\Models\DailyAttendance::where('employee_id', $employee->employee_id)
                ->where('date', $date)
                ->first();

            // If exists, extract in/out time
            $inTime  = $attendance?->in_time;
            $outTime = $attendance?->out_time;

            // --- 4️⃣ Fetch allowed entry time (user schedule) ---
            $assignment = DB::table('time_assignments')
                ->where('employee_id', $employee->employee_id)
                ->first();

            $allowedEntry = $assignment?->allowed_entry;

            // --- 5️⃣ Build row ---
            $report[] = [
                'employee_id'   => $employee->employee_id,
                'name'          => $employee->name,
                'designation'   => $employee->designation,
                'in_time'       => $inTime,
                'out_time'      => $outTime,
                'allowed_entry' => $allowedEntry,
            ];
        }

        //dd($report);
        return inertia('DeptHead/Attendance', [
            'date' => $date,
            'department' => [
                'id'   => $departmentId,
                'name' => $departmentName,
            ],
            'report' => $report,
        ]);
    }


    // app/Http/Controllers/DeptHeadAttendanceController.php
    public function employeeMonthly(Request $request, $employeeId)
    {
        $user = Auth::user();

        // ✅ verify dept head
        $deptHead = DB::table('dept_heads')->where('employee_id', $user->employee_id)->first();
        if (!$deptHead) {
            abort(403, 'Not authorized');
        }

        // ✅ check that the employee belongs to their department
        $belongs = DB::table('user_assignments')
            ->where('employee_id', $employeeId)
            ->where('department_id', $deptHead->department_id)
            ->exists();

        if (!$belongs) {
            abort(403, 'Employee not in your department');
        }

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

}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sendAttendanceReport()
    {
        Artisan::call('report:send-department-attendance');

        return back()->with('success', 'Attendance report sent to department heads!');
    }

    public function downloadPdf(Request $request)
    {
        $date = $request->date;

        $summaryTable = [];
        $lateDetails = [];
        $absentDetails = [];

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
                $attendance = \App\Models\DailyAttendance::where('employee_id', $employee->employee_id)
                    ->where('date', $date)
                    ->first();

                if ($attendance) {
                    if (str_contains($attendance->status, 'late entry')) {
                        $lateCount++;
                        $lateEmployees[] = (object) array_merge((array) $employee, ['in_time' => $attendance->in_time]);
                    }
                } else {
                    $absentEmployees[] = $employee;
                }
            }

            $summaryTable[] = [
                'department' => $departmentName,
                'total'      => $totalCount,
                'late'       => $lateCount,
                'absent'     => count($absentEmployees),
            ];

            if (!empty($lateEmployees)) {
                $lateDetails[$departmentName] = array_map(function ($e) {
                    return [
                        'employee_id' => $e->employee_id,
                        'name'        => $e->name,
                        'designation' => $e->designation,
                        'in_time'     => $e->in_time ?? null,
                    ];
                }, $lateEmployees);
            }

            if (!empty($absentEmployees)) {
                $absentDetails[$departmentName] = array_map(function ($e) {
                    return [
                        'employee_id' => $e->employee_id,
                        'name'        => $e->name,
                        'designation' => $e->designation,
                    ];
                }, $absentEmployees);
            }
        }

        $data = compact('date', 'summaryTable', 'lateDetails', 'absentDetails');

        return Pdf::loadView('late-summary', $data)
            ->setPaper('a4', 'portrait')
            ->download("Late_Absent_Summary_{$date}.pdf");
    }

}


<?php

namespace App\Console\Commands;

use App\Mail\DepartmentAttendanceReport;
use App\Mail\LateEmployeesSummaryReport;
use App\Models\DeptHead;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class SendDepartmentAttendanceReport extends Command
{
    protected $signature = 'report:send-department-attendance';
    protected $description = 'Send department-wise attendance reports to department heads';

    public function handle()
    {
        $summaryTable = [];
        $lateDetails = [];
        $absentDetails = [];
        $date = now()->toDateString();
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();
        $dayBefore = now()->subDays(2)->toDateString();

//        $rawDates = [$yesterday, $today];
//        $rawDates = [$yesterday];
        $rawDates = [$dayBefore, $yesterday, $today];
//        $rawDates = [$dayBefore, $yesterday];

        // Exclude Friday (5) and Saturday (6)
        $dates = collect($rawDates)->filter(function ($date) {
            $dayOfWeek = Carbon::parse($date)->dayOfWeekIso;
            return !in_array($dayOfWeek, [5, 6]);
        })->values()->all();

//        $dateRange = "{$dayBefore} to {$today}";
        $dateRange = "{$yesterday} to {$today}";

        /*$today = now();
        $startDate = now()->subDays(20); // For 15-day range

        $rawDates = collect();
        for ($date = $startDate->copy(); $date <= $today; $date->addDay()) {
            $rawDates->push($date->toDateString());
        }

        $dates = $rawDates->filter(function ($date) {
            $dayOfWeek = Carbon::parse($date)->dayOfWeekIso;
            return !in_array($dayOfWeek, [5, 6]); // Exclude Friday & Saturday
        })->values()->all();

        $dateRange = "{$startDate->toDateString()} to {$today->toDateString()}";*/


        $departments = DeptHead::with(['department', 'user'])->get();

        foreach ($departments as $deptHead) {
            $absentEmployees = []; // reset here
            $deptId = $deptHead->department_id;
            $headEmail = $deptHead->user->email ?? null;
            $departmentName = $deptHead->department->dept_name ?? 'Unknown';

            $employees = DB::table('users')
                ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
                ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
                ->where('user_assignments.department_id', $deptId)
                ->select('users.employee_id', 'users.name', 'designations.designation_name as designation')
                ->get();

            $totalCount = $employees->count();
            $lateCount = 0;
            $lateEmployees = [];
            $report = collect();

            foreach ($employees as $employee) {
                foreach ($dates as $date) {
                    $log = DB::table('device_logs')
                        ->where('employee_id', $employee->employee_id)
                        ->whereDate('timestamp', $date)
                        ->orderBy('timestamp')
                        ->pluck('timestamp');

                    $inTime = ($log->count() > 0 && $log->first()) ? Carbon::parse($log->first())->format('H:i:s') : 'Absent';
                    $inTimeC = ($log->count() > 0 && $log->first()) ? Carbon::parse($log->first())->format('H:i') : '';
                    $outTime = ($log->count() > 1 && $log->last() !== $log->first()) ? Carbon::parse($log->last())->format('H:i:s') : '';
                    $outTimeC = ($log->count() > 1 && $log->last() !== $log->first()) ? Carbon::parse($log->last())->format('H:i') : '';
                    if ($inTimeC == $outTimeC) $outTime = '';

//                    if ($inTime === 'Absent' && $date == $today) {
//                        $absentEmployees[] = $employee;
//                    }
                    if ($inTime === 'Absent' && $date == $today) {
                        $absentEmployees[] = $employee;
                    }

                    // Push both present and absent employees into report
                    $report->push((object) [
                        'employee_id' => $employee->employee_id,
                        'name' => $employee->name,
                        'designation' => $employee->designation,
                        'date' => $date,
                        'in_time' => $inTime,
                        'out_time' => $outTime
                    ]);
                }

                $firstLog = DB::table('device_logs')
                    ->where('employee_id', $employee->employee_id)
                    ->whereDate('timestamp', $today)
//                    ->whereDate('timestamp', $yesterday)
                    ->orderBy('timestamp')
                    ->first();

                /*if ($firstLog) {
                    $inTime = Carbon::parse($firstLog->timestamp)->format('H:i:s');
                    if ($inTime > '08:10:00') {
                        $lateCount++;
                        $employee->in_time = $inTime;
                        $lateEmployees[] = $employee;
                    }
                }*/

                if ($firstLog) {
                    $inTime = Carbon::parse($firstLog->timestamp)->format('H:i:s');
                    if ($inTime > '08:30:00') {
                        $lateCount++;
                        // Create a copy of employee data with in_time property
                        $empWithInTime = (object) array_merge((array) $employee, ['in_time' => $inTime]);
                        $lateEmployees[] = $empWithInTime;
                    }
                }
            }

            $summaryTable[] = [
                'department' => $departmentName,
                'total' => $totalCount,
                'late' => $lateCount,
                'absent' => count($absentEmployees)
            ];

            if (!empty($lateEmployees)) {
                $lateDetails[$departmentName] = $lateEmployees;
            }
            if (!empty($absentEmployees)) {
                $absentDetails[$departmentName] = $absentEmployees; // optional for separate display
            }

            /*if ($report->isNotEmpty() && $headEmail) {
                $mailable = new DepartmentAttendanceReport($departmentName, $report, $dateRange);
                $html = $mailable->render();
                File::put(storage_path("app/preview_{$deptId}.html"), $html);
                $this->info("Email for {$departmentName} rendered to storage/app/preview_{$deptId}.html");
            }*/

            if ($report->isNotEmpty() && $headEmail) {
                $mailable = new DepartmentAttendanceReport($departmentName, $report, $dateRange);

                $html = $mailable->render();

                File::put(storage_path("app/preview_{$departmentName}.html"), $html);

//                Mail::to($headEmail)->send($mailable);
                /*Mail::to('ruhulamin@baust.edu.bd')->send($mailable);*/

            }
        }

        $mailable2 = new LateEmployeesSummaryReport($summaryTable, $lateDetails, $absentDetails, $date);

// Save a preview copy

        $html2 = $mailable2->render();
        File::put(storage_path("app/late_summary_preview.html"), $html2);
//        Mail::to('registrar@baust.edu.bd')->send($mailable2);
//        Mail::to('ruhulamin@baust.edu.bd')->send($mailable2);
// Send only to registrar
//        try {
//            Mail::to('registrar@baust.edu.bd')->send($mailable2);
//            $this->info("Late & Absent Employees Summary sent to registrar@baust.edu.bd");
//        } catch (\Exception $e) {
//            $this->error("Failed to send summary to registrar: " . $e->getMessage());
//        }

        $this->info("Department attendance reports rendered successfully.");
    }
}

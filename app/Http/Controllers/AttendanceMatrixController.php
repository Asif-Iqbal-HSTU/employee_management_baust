<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\UserAssignment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceMatrixController extends Controller
{
    public function form()
    {
        return inertia('attendance/MatrixForm', [
            'departments' => \App\Models\Department::all(),
        ]);
    }

    public function generate0(Request $request)
    {
        $request->validate([
            'department_id' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Generate all dates between range but skip Fri/Sat
        $dates = collect(
            Carbon::parse($request->start_date)
                ->daysUntil(Carbon::parse($request->end_date)->addDay())
        )
            ->filter(fn($d) => !in_array($d->format('D'), ['Fri', 'Sat']))
            ->values()
            ->map(fn($d) => $d->format('Y-m-d'))
            ->toArray();   // <-- IMPORTANT: send to React as ARRAY

        // Officers & Faculty of the department
        $users = UserAssignment::with(['user', 'designation'])
            ->officerFaculty()
            ->where('department_id', $request->department_id)
            ->get();

        $data = [];

        foreach ($users as $assignment) {
            $employee = $assignment->user;

            $row = [
                'employee_id' => $employee->employee_id,
                'name' => $employee->name,
                'designation' => $assignment->designation->designation_name,
                'days' => []
            ];

            foreach ($dates as $date) {
                $att = DailyAttendance::where('employee_id', $employee->employee_id)
                    ->where('date', $date)
                    ->first();

                if (!$att) {
                    $row['days'][$date] = "A";
                } else {
                    $row['days'][$date] = match ($att->status) {
                        'ok' => 'P',
                        'late entry' => 'LE',
                        'early leave' => 'EL',
                        default => 'P'
                    };
                }
            }

            $data[] = $row;
        }

        session([
            'matrix_dates' => $dates,
            'matrix_data'  => $data,
        ]);


        return inertia('attendance/MatrixReport', [
            'matrix' => $data,
            'dates' => $dates,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'department_id' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Generate all dates between range but skip Fri/Sat
        $dates = collect(
            Carbon::parse($request->start_date)
                ->daysUntil(Carbon::parse($request->end_date)->addDay())
        )
            ->filter(fn($d) => !in_array($d->format('D'), ['Fri', 'Sat']))
            ->values()
            ->map(fn($d) => $d->format('Y-m-d'))
            ->toArray();

        // Officers & Faculty of the department
        $users = UserAssignment::with(['user', 'designation'])
            ->officerFaculty()
            ->where('department_id', $request->department_id)
            ->get();

        $data = [];

        foreach ($users as $assignment) {
            $employee = $assignment->user;

            // Counters
            $totalWorkday = count($dates);
            $totalPresent = 0;
            $totalAbsent = 0;
            $totalEarlyLeave = 0;
            $totalLateEntry = 0;

            $row = [
                'employee_id' => $employee->employee_id,
                'name' => $employee->name,
                'designation' => $assignment->designation->designation_name,
                'days' => []
            ];

            foreach ($dates as $date) {
                $att = DailyAttendance::where('employee_id', $employee->employee_id)
                    ->where('date', $date)
                    ->first();

                if (!$att) {
                    $row['days'][$date] = "A";
                    $totalAbsent++;
                } else {
                    $status = match ($att->status) {
                        'ok' => 'P',
                        'late entry' => 'LE',
                        'early leave' => 'EL',
                        default => 'P'
                    };

                    $row['days'][$date] = $status;

                    // Count summary items
                    if ($status === 'P') $totalPresent++;
                    if ($status === 'LE') $totalLateEntry++;
                    if ($status === 'EL') $totalEarlyLeave++;
                }
            }

            // Add summary columns
            $row['TWD'] = $totalWorkday;
            $row['TP'] = $totalPresent;
            $row['TA'] = $totalAbsent;
            $row['TEL'] = $totalEarlyLeave;
            $row['TLE'] = $totalLateEntry;

            $data[] = $row;
        }

        session([
            'matrix_dates' => $dates,
            'matrix_data'  => $data,
        ]);

        return inertia('attendance/MatrixReport', [
            'matrix' => $data,
            'dates' => $dates,
        ]);
    }


    public function pdf(Request $request)
    {
        // You may regenerate the report using last session values OR pass the query again.
        // For now, simply reuse the latest generated data:
        $dates = session('matrix_dates');
        $matrix = session('matrix_data');

        if (!$dates || !$matrix) {
            return back()->with('error', 'Please generate the report first.');
        }

        $pdf = \PDF::loadView('pdf.matrix', [
            'dates' => $dates,
            'matrix' => $matrix
        ])
            ->setPaper('legal', 'landscape'); // Fit wide tables

        return $pdf->download('attendance_matrix.pdf');
    }

    public function summaryGenerate(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Generate date list and skip Fri/Sat
        $dates = collect(
            Carbon::parse($request->start_date)
                ->daysUntil(Carbon::parse($request->end_date)->addDay())
        )
            ->filter(fn($d) => !in_array($d->format('D'), ['Fri', 'Sat']))
            ->values()
            ->map(fn($d) => $d->format('Y-m-d'))
            ->toArray();

        // Fetch all officers/faculty of ALL departments
        $users = UserAssignment::with(['user'])
            ->officerFaculty()
            ->get();

        $summary = [
            'total_workdays' => count($dates),
            'present' => 0,
            'absent' => 0,
            'late_entry' => 0,
            'early_leave' => 0,
        ];

        foreach ($users as $assignment) {
            $employee_id = $assignment->user->employee_id;

            foreach ($dates as $date) {
                $att = DailyAttendance::where('employee_id', $employee_id)
                    ->where('date', $date)
                    ->first();

                if (!$att) {
                    $summary['absent']++;
                } else {
                    match ($att->status) {
                        'ok' => $summary['present']++,
                        'late entry' => $summary['late_entry']++,
                        'early leave' => $summary['early_leave']++,
                        default => $summary['present']++,
                    };
                }
            }
        }

        session([
            'summary' => $summary,
            'summary_dates' => $dates,
        ]);

        return inertia('attendance/SummaryReport', [
            'summary' => $summary,
            'dates' => $dates,
        ]);
    }

    public function summaryPdf()
    {
        $summary = session('summary');
        $dates = session('summary_dates');

        if (!$summary || !$dates) {
            return back()->with('error', 'Please generate a summary first.');
        }

        $pdf = \PDF::loadView('pdf.summary', [
            'summary' => $summary,
            'dates' => $dates,
        ])->setPaper('legal', 'portrait');

        return $pdf->download('attendance_summary.pdf');
    }



}


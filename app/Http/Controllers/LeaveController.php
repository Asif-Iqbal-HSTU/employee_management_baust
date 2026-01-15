<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\Leave;
use App\Models\User;
use App\Models\Worklog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\DB;

class LeaveController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $leaves = Leave::query()
            ->leftJoin('users as replacer', 'replacer.employee_id', '=', 'leaves.replace')
            ->where('leaves.employee_id', $user->employee_id)
            ->orderBy('leaves.start_date', 'desc')
            ->select(
                'leaves.*',
                'replacer.name as replacement_name'
            )
            ->get();

        // Default yearly limits
        $defaultCasual  = 20;
        $defaultMedical = 15;
        $defaultEarned = 30;

        // Used casual leave days
        $usedCasual = $leaves
            ->where('type', 'Casual Leave')
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar'])
            ->sum(fn ($leave) =>
                Carbon::parse($leave->start_date)
                    ->diffInDays(Carbon::parse($leave->end_date)) + 1
            );

        // Used medical leave days
        $usedMedical = $leaves
            ->where('type', 'Medical Leave')
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar'])
            ->sum(fn ($leave) =>
                Carbon::parse($leave->start_date)
                    ->diffInDays(Carbon::parse($leave->end_date)) + 1
            );
// Used medical leave days
        $usedEarned = $leaves
            ->where('type', 'Earned Leave')
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar'])
            ->sum(fn ($leave) =>
                Carbon::parse($leave->start_date)
                    ->diffInDays(Carbon::parse($leave->end_date)) + 1
            );

        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $user->assignment->department_id)
            ->select(
                'users.employee_id',
                'users.name',
                'designations.designation_name as designation'
            )
            ->orderBy('users.name')
            ->get();

        return inertia('Leave/index', [
            'leaves'           => $leaves,
            'remainingCasual'  => max(0, $defaultCasual - $usedCasual),
            'remainingMedical' => max(0, $defaultMedical - $usedMedical),
            'remainingEarned' => max(0, $defaultEarned - $usedEarned),
            'usedCasual'       => $usedCasual,
            'usedMedical'      => $usedMedical,
            'usedEarned'       => $usedEarned,
            'employees'        => $employees,
        ]);
    }


    public function indexHead()
    {
        $user = Auth::user();

        // 1️⃣ Verify department head
        $deptHead = DB::table('dept_heads')
            ->where('employee_id', $user->employee_id)
            ->first();

        if (!$deptHead) {
            abort(403, 'You are not a department head.');
        }

        $departmentId = $deptHead->department_id;

        // 2️⃣ Pending leave requests (LEFT)
        $pendingLeaves = Leave::query()
            ->join('users', 'users.employee_id', '=', 'leaves.employee_id')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->join('designations', 'designations.id', '=', 'user_assignments.designation_id')

            // 👇 JOIN replacement employee
            ->leftJoin('users as rep', 'rep.employee_id', '=', 'leaves.replace')

            ->where('user_assignments.department_id', $departmentId)
            ->where('leaves.status', 'Requested to head')
            ->orderBy('leaves.start_date', 'desc')
            ->select(
                'leaves.id',
                'leaves.employee_id',
                'users.name',
                'designations.designation_name as designation',
                'leaves.start_date',
                'leaves.end_date',
                'leaves.reason',
                'leaves.type',
                'leaves.status',
                'leaves.medical_file',

                // 👇 alias replacement name
                'rep.name as replacement_name'
            )
            ->get();


        // 3️⃣ Employees for Leave Register (RIGHT)
        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $departmentId)
            ->select(
                'users.employee_id',
                'users.name',
                'designations.designation_name as designation'
            )
            ->orderBy('users.name')
            ->get();

        return inertia('Leave/head', [
            'leaves' => $pendingLeaves,
            'employees'     => $employees,
        ]);
    }

    public function employeeLeaves($employee_id)
    {
        $leaves = Leave::where('employee_id', $employee_id)
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($leave) {
                return [
                    'type'        => $leave->type,
                    'start_date'  => $leave->start_date,
                    'end_date'    => $leave->end_date,
                    'days'        =>
                        \Carbon\Carbon::parse($leave->start_date)
                            ->diffInDays(\Carbon\Carbon::parse($leave->end_date)) + 1,
                    'replace'     => $leave->replace,
                    'status'      => $leave->status,
                ];
            });

        return response()->json($leaves);
    }


    // 2️⃣ Approve leave → Send to Registrar
    public function approveByHead($id)
    {
        $leave = Leave::findOrFail($id);

        $leave->update([
            'status' => 'Sent to Registrar',
        ]);

        // Insert into DailyAttendance table for each date
        $start = Carbon::parse($leave->start_date);
        $end   = Carbon::parse($leave->end_date);

        while ($start->lte($end)) {
            DailyAttendance::updateOrCreate(
                [
                    'employee_id' => $leave->employee_id,
                    'date' => $start->toDateString()
                ],
                [
                    'in_time' => null,
                    'out_time' => null,
                    'status' => 'On Leave',
                    'remarks' => 'Leave approved by Head'
                ]
            );

            $start->addDay();
        }

        return back()->with('success', 'Leave forwarded to Registrar.');
    }

    // 3️⃣ Deny leave
    public function denyByHead($id)
    {
        $leave = Leave::findOrFail($id);

        $leave->update([
            'status' => 'Denied by Head',
        ]);

        return back()->with('success', 'Leave request denied.');
    }

    public function store(Request $request)
    {
        //dd($request);
        $request->validate([
            'leave_type' => 'required|in:Medical Leave,Casual Leave,Earned Leave,Duty Leave',
            'startdate'  => 'required|date',
            'enddate'    => 'required|date|after_or_equal:startdate',
            'reason'     => 'nullable|string',
            'replace'    => 'nullable|string',
            'medical_file' => [
                'nullable',
                'required_if:leave_type,Medical Leave',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:2048', // 2MB
            ],
        ]);

        $user = Auth::user();
        // 🚫 Check overlapping leave dates
        $conflict = Leave::where('employee_id', $user->employee_id)
            ->whereIn('status', [
                'Requested to Head',
                'Sent to Registrar',
                'Approved by Registrar',
            ])
            ->where(function ($q) use ($request) {
                $q->whereDate('start_date', '<=', $request->enddate)
                    ->whereDate('end_date', '>=', $request->startdate);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'date_conflict' => 'You already have a leave request or approved leave within the selected date range.',
            ]);
        }


        $requestedDays =
            Carbon::parse($request->startdate)
                ->diffInDays(Carbon::parse($request->enddate)) + 1;

        $defaultCasual = 20;
        $defaultMedical = 15;

        $used = Leave::where('employee_id', $user->employee_id)
            ->where('type', $request->leave_type)
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar'])
            ->get()
            ->sum(fn ($leave) =>
                Carbon::parse($leave->start_date)
                    ->diffInDays(Carbon::parse($leave->end_date)) + 1
            );

        $remaining = match ($request->leave_type) {
            'Casual Leave'  => $defaultCasual - $used,
            'Medical Leave' => $defaultMedical - $used,
            default => PHP_INT_MAX,
        };

        if ($requestedDays > $remaining) {
            return back()->withErrors([
                'balance' => "Requested {$requestedDays} days exceeds remaining {$remaining} days.",
            ]);
        }


        $medicalPath = null;

        if ($request->hasFile('medical_file')) {
            $medicalPath = $request->file('medical_file')
                ->store('medical-certificates', 'public');
        }

        // Create the leave
        $leave = Leave::create([
            'employee_id' => $user->employee_id,
            'start_date'  => $request->startdate,
            'end_date'    => $request->enddate,
            'type'        => $request->leave_type,
            'reason'      => $request->reason,
            'replace'     => $request->replace,
            'medical_file'=> $medicalPath,
            'status'      => 'Requested to Head',
        ]);

//        dd($leave);

        // 🔔 Notify the department head
//        $deptHead = User::whereHas('deptHead', function($q) use ($user) {
//            $q->where('department_id', $user->assignment->department_id ?? 0);
//        })->first();

//        if ($deptHead) {
//            $deptHead->notify(new NewLeaveRequest($user->name, $leave->id));
//        }

        return redirect()->route('leave.index')->with('success', 'Leave Requested Successfully');
    }
}

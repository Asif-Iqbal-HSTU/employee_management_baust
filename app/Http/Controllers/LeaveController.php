<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\Leave;
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

        $leaves = Leave::where('employee_id', $user->employee_id)
            ->orderBy('start_date', 'desc')
            ->get();

        // default values
        $defaultCasual = 20;
        $defaultMedical = 15;

        // Count used leaves
        $usedCasual = $leaves->where('status', 'Casual Leave')->count();
        $usedMedical = $leaves->where('status', 'Medical Leave')->count();

        return inertia('Leave/index', [
            'leaves'         => $leaves,
            'remainingCasual' => $defaultCasual - $usedCasual,
            'remainingMedical' => $defaultMedical - $usedMedical,
        ]);
    }

    // 1️⃣ Show pending leave requests for this department head
    public function indexHead()
    {
        $user = Auth::user();

        // Find department head
        $deptHead = DB::table('dept_heads')
            ->where('employee_id', $user->employee_id)
            ->first();

        if (!$deptHead) {
            abort(403, 'You are not a department head.');
        }

        $departmentId = $deptHead->department_id;

        // Fetch employees of this department with pending leave requests
        $leaves = Leave::query()
            ->join('users', 'users.employee_id', '=', 'leaves.employee_id')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->join('designations', 'designations.id', '=', 'user_assignments.designation_id')
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
                'leaves.status'
            )
            ->get();

        return inertia('Leave/head', [
            'leaves' => $leaves,
        ]);
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
        $request->validate([
            'leave_type' => 'required|in:Medical Leave,Casual Leave',
            'startdate'       => 'required|date',
            'enddate'       => 'required|date',
            'reason'     => 'nullable|string',
            'replace'    => 'nullable|string',
        ]);

        $user = Auth::user();

        Leave::create([
            'employee_id' => $user->employee_id,
            'start_date'        => $request->startdate,
            'end_date'        => $request->enddate,
            'type'        => $request->leave_type,
            'reason'      => $request->reason,
            'replace'     => $request->replace,
            'status'      => 'Requested to Head',
        ]);

        return redirect()->route('leave.index')->with('success', 'Leave Requested Successfully');
    }


}

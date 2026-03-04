<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\DailyAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class RegistrarLeaveController extends Controller
{
    // Show all leave requests waiting for Registrar
    public function index()
    {
        $leaves = Leave::with(['user.assignment.department', 'user.assignment.designation'])
            ->where('status', 'Sent to Registrar')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Leave/registrar', [
            'leaves' => $leaves
        ]);
    }


    // Registrar approves
    public function approve($id)
    {
        $leave = Leave::findOrFail($id);

        $leave->update([
            'status' => 'Approved by Registrar'
        ]);

        // Insert into DailyAttendance table for each date
        $start = Carbon::parse($leave->start_date);
        $end = Carbon::parse($leave->end_date);

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
                    'remarks' => 'Leave approved by Registrar'
                ]
            );

            $start->addDay();
        }

        return back()->with('success', 'Leave Approved Successfully');
    }

    // Registrar rejects
    public function deny($id)
    {
        $leave = Leave::findOrFail($id);

        $leave->update([
            'status' => 'Rejected by Registrar'
        ]);

        return back()->with('success', 'Leave Rejected');
    }

    // Registrar Bulk Update
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'status' => 'required|in:Approved by Registrar,Rejected by Registrar'
        ]);

        $leaves = Leave::whereIn('id', $request->ids)
            ->where('status', 'Sent to Registrar')
            ->get();

        foreach ($leaves as $leave) {
            $leave->update([
                'status' => $request->status
            ]);

            if ($request->status === 'Approved by Registrar') {
                $start = Carbon::parse($leave->start_date);
                $end = Carbon::parse($leave->end_date);

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
                            'remarks' => 'Leave approved by Registrar'
                        ]
                    );

                    $start->addDay();
                }
            }
        }

        return back()->with('success', 'Leaves updated successfully');
    }

    public function allLeaves()
    {
        $departments = \App\Models\Department::orderBy('dept_name')->get();
        $today = Carbon::today()->toDateString();
        
        // Employees on leave today (all departments)
        $onLeaveToday = Leave::with(['user.assignment.department', 'user.assignment.designation'])
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar', 'Approved by VC'])
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->get();

        return Inertia::render('Leave/RegistrarRegister', [
            'departments' => $departments,
            'onLeaveToday' => $onLeaveToday,
        ]);
    }

    public function departmentEmployees($deptId)
    {
        $employees = \App\Models\UserAssignment::with(['user', 'designation'])
            ->where('department_id', $deptId)
            ->get()
            ->map(function ($assignment) {
                return [
                    'employee_id' => $assignment->user->employee_id,
                    'name' => $assignment->user->name,
                    'designation' => $assignment->designation?->designation_name ?? '—',
                ];
            });

        return response()->json($employees);
    }
}

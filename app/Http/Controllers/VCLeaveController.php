<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\User;
use App\Models\DailyAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class VCLeaveController extends Controller
{
    // Senior officers whose leaves need VC approval
    // Senior officers whose leaves need VC approval - Dynamically checked by designation now
    // private const SENIOR_OFFICER_IDS = ['25040', '15012', '21023']; 

    /**
     * Check if an employee is a senior officer requiring VC approval
     */
    public static function isSeniorOfficer($employee_id): bool
    {
        $user = User::with('assignment.designation')->where('employee_id', $employee_id)->first();

        if (!$user || !$user->assignment || !$user->assignment->designation) {
            return false;
        }

        $designation = $user->assignment->designation->designation_name;

        // Based on user request: Registrar, Additional Registrar, Controller of Examinations, Treasurer
        // Note: 'Controller of Examinations' is likely 'Exam Controller' in DB
        $seniorDesignations = [
            'Registrar',
            'Additional Registrar',
            'Exam Controller', 
            'Controller of Examinations',
            'Treasurer'
        ];

        return in_array($designation, $seniorDesignations);
    }

    /**
     * Show all leave requests waiting for VC approval
     */
    public function index()
    {
        $user = Auth::user();

        // Only VC can access this page
        if ($user->employee_id != '25045') {
            abort(403, 'Access denied.');
        }

        // Fetch leaves with status 'Requested to VC'
        $leaves = Leave::query()
            ->join('users', 'users.employee_id', '=', 'leaves.employee_id')
            ->leftJoin('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->leftJoin('departments', 'departments.id', '=', 'user_assignments.department_id')
            ->leftJoin('users as rep', 'rep.employee_id', '=', 'leaves.replace')
            ->where('leaves.status', 'Requested to VC')
            ->orderBy('leaves.created_at', 'desc')
            ->select(
                'leaves.id',
                'leaves.employee_id',
                'users.name',
                'designations.designation_name as designation',
                'departments.dept_name as department',
                'leaves.start_date',
                'leaves.end_date',
                'leaves.reason',
                'leaves.type',
                'leaves.status',
                'leaves.medical_file',
                'rep.name as replacement_name'
            )
            ->get()
            ->map(function ($leave) {
                $leave->requested_days = \App\Services\LeaveService::calculateLeaveDays($leave->start_date, $leave->end_date);
                return $leave;
            });

        return Inertia::render('Leave/vc', [
            'leaves' => $leaves,
        ]);
    }

    /**
     * VC approves leave - directly approved (no registrar step needed)
     */
    public function approve($id)
    {
        $user = Auth::user();

        // Only VC can approve
        if ($user->employee_id != '25045') {
            abort(403, 'Access denied.');
        }

        $leave = Leave::findOrFail($id);

        $leave->update([
            'status' => 'Approved by VC'
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
                    'remarks' => 'Leave approved by Vice Chancellor'
                ]
            );

            $start->addDay();
        }

        return back()->with('success', 'Leave Approved Successfully');
    }

    /**
     * VC rejects leave
     */
    public function deny($id)
    {
        $user = Auth::user();

        // Only VC can reject
        if ($user->employee_id != '25045') {
            abort(403, 'Access denied.');
        }

        $leave = Leave::findOrFail($id);

        $leave->update([
            'status' => 'Rejected by VC'
        ]);

        return back()->with('success', 'Leave Rejected');
    }
}

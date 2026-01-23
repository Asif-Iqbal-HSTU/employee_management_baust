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
    private const SENIOR_OFFICER_IDS = ['25040', '15012', '21023']; // Registrar, Treasurer, Exam Controller

    /**
     * Check if an employee is a senior officer requiring VC approval
     */
    public static function isSeniorOfficer($employee_id): bool
    {
        return in_array((string) $employee_id, self::SENIOR_OFFICER_IDS);
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
                $leave->requested_days = Carbon::parse($leave->start_date)->diffInDays(Carbon::parse($leave->end_date)) + 1;
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

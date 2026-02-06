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
use App\Services\LeaveService;

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
        $defaultCasual = 20;
        $defaultMedical = 15;
        $defaultEarned = 30;

        // Used casual leave days
        $usedCasual = $leaves
            ->where('type', 'Casual Leave')
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar', 'Approved by VC', 'Cancellation Requested'])
            ->sum(
                fn($leave) =>
                LeaveService::calculateLeaveDays($leave->start_date, $leave->end_date)
            );

        // Used medical leave days
        $usedMedical = $leaves
            ->where('type', 'Medical Leave')
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar', 'Approved by VC', 'Cancellation Requested'])
            ->sum(
                fn($leave) =>
                LeaveService::calculateLeaveDays($leave->start_date, $leave->end_date)
            );
        // Used medical leave days
        $usedEarned = $leaves
            ->where('type', 'Earned Leave')
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar', 'Approved by VC', 'Cancellation Requested'])
            ->sum(
                fn($leave) =>
                LeaveService::calculateLeaveDays($leave->start_date, $leave->end_date)
            );

        // Employees from user's own department (for default selection)
        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->leftJoin('departments', 'departments.id', '=', 'user_assignments.department_id')
            ->select(
                'users.employee_id',
                'users.name',
                'designations.designation_name as designation',
                'user_assignments.department_id',
                'departments.dept_name'
            )
            ->orderBy('users.name')
            ->get();

        // All departments for dropdown
        $departments = DB::table('departments')
            ->select('id', 'dept_name')
            ->orderBy('dept_name')
            ->get();

        // User's current department ID
        $userDeptId = $user->assignment?->department_id;

        // Holidays for frontend calculation
        $holidays = \App\Models\Holiday::pluck('date')->toArray();

        return inertia('Leave/index', [
            'leaves' => $leaves,
            'remainingCasual' => max(0, $defaultCasual - $usedCasual),
            'remainingMedical' => max(0, $defaultMedical - $usedMedical),
            'remainingEarned' => max(0, $defaultEarned - $usedEarned),
            'usedCasual' => $usedCasual,
            'usedMedical' => $usedMedical,
            'usedEarned' => $usedEarned,
            'employees' => $employees,
            'departments' => $departments,
            'userDeptId' => $userDeptId,
            'holidays' => $holidays,
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

        // Default yearly limits
        $defaultCasual = 20;
        $defaultMedical = 15;
        $defaultEarned = 30;

        // 2️⃣ Pending leave requests (LEFT)
        $pendingLeaves = Leave::query()
            ->join('users', 'users.employee_id', '=', 'leaves.employee_id')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->join('designations', 'designations.id', '=', 'user_assignments.designation_id')

            // 👇 JOIN replacement employee
            ->leftJoin('users as rep', 'rep.employee_id', '=', 'leaves.replace')

            ->where('user_assignments.department_id', $departmentId)
            ->whereIn('leaves.status', ['Requested to head', 'Cancellation Requested'])
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

        // 3️⃣ Calculate leave balances for each applicant
        $pendingLeaves = $pendingLeaves->map(function ($leave) use ($defaultCasual, $defaultMedical, $defaultEarned) {
            // Fetch all approved/forwarded leaves for this employee
            $employeeLeaves = Leave::where('employee_id', $leave->employee_id)
                ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar', 'Approved by VC', 'Cancellation Requested'])
                ->get();

            // Calculate used days for each type
            $usedCasual = $employeeLeaves
                ->where('type', 'Casual Leave')
                ->where('type', 'Casual Leave')
                ->sum(fn($l) => LeaveService::calculateLeaveDays($l->start_date, $l->end_date));

            $usedMedical = $employeeLeaves
                ->where('type', 'Medical Leave')
                ->where('type', 'Medical Leave')
                ->sum(fn($l) => LeaveService::calculateLeaveDays($l->start_date, $l->end_date));

            $usedEarned = $employeeLeaves
                ->where('type', 'Earned Leave')
                ->where('type', 'Earned Leave')
                ->sum(fn($l) => LeaveService::calculateLeaveDays($l->start_date, $l->end_date));

            // Calculate requested days for this leave
            $requestedDays = LeaveService::calculateLeaveDays($leave->start_date, $leave->end_date);

            // Attach balance info
            $leave->requested_days = $requestedDays;
            $leave->remaining_casual = max(0, $defaultCasual - $usedCasual);
            $leave->remaining_medical = max(0, $defaultMedical - $usedMedical);
            $leave->remaining_earned = max(0, $defaultEarned - $usedEarned);

            return $leave;
        });


        // 4️⃣ Employees for Leave Register (RIGHT)
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

        // 5️⃣ Employees on Leave Today
        $today = Carbon::today()->toDateString();
        $onLeaveToday = Leave::query()
            ->join('users', 'users.employee_id', '=', 'leaves.employee_id')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $departmentId)
            ->whereIn('leaves.status', ['Sent to Registrar', 'Approved by Registrar'])
            ->whereDate('leaves.start_date', '<=', $today)
            ->whereDate('leaves.end_date', '>=', $today)
            ->select(
                'users.employee_id',
                'users.name',
                'designations.designation_name as designation',
                'leaves.type',
                'leaves.start_date',
                'leaves.end_date'
            )
            ->get();

        return inertia('Leave/head', [
            'leaves' => $pendingLeaves,
            'employees' => $employees,
            'onLeaveToday' => $onLeaveToday,
            'today' => $today,
        ]);
    }

    public function employeeLeaves($employee_id)
    {
        $leaves = Leave::where('employee_id', $employee_id)
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($leave) {
                // Lookup replacement employee name
                $replacementName = null;
                if ($leave->replace) {
                    $replacer = User::where('employee_id', $leave->replace)->first();
                    $replacementName = $replacer?->name;
                }

                return [
                    'type' => $leave->type,
                    'start_date' => $leave->start_date,
                    'end_date' => $leave->end_date,
                    'days' =>
                        LeaveService::calculateLeaveDays($leave->start_date, $leave->end_date),
                    'replace' => $replacementName,
                    'status' => $leave->status,
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
        $end = Carbon::parse($leave->end_date);

        while ($start->lte($end)) {
            // (Previous sandwich rule override) Now we create attendance for ALL days in the span.
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
            'startdate' => 'required|date',
            'enddate' => 'required|date|after_or_equal:startdate',
            'reason' => 'nullable|string',
            'replace' => 'nullable|string',
            'medical_file' => [
                'nullable',
                'required_if:leave_type,Medical Leave',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:2048', // 2MB
            ],
        ]);

        $user = Auth::user();

        // --- SANDWICH RULE CHECK ---
        // Check if this request bridges with existing leaves over holidays/weekends
        $bridgedInfo = LeaveService::getBridgedDates($user->employee_id, $request->startdate, $request->enddate);
        
        $finalStartDate = $bridgedInfo['start'];
        $finalEndDate = $bridgedInfo['end'];
        $wasBridged = $bridgedInfo['bridged'];

        // Check if user is a senior officer (requires VC approval)
        $isSeniorOfficer = VCLeaveController::isSeniorOfficer($user->employee_id);

        // 🚫 Check overlapping leave dates (using extended dates)
        $conflict = Leave::where('employee_id', $user->employee_id)
            ->whereIn('status', [
                'Requested to Head',
                'Requested to VC',
                'Sent to Registrar',
                'Approved by Registrar',
                'Approved by VC',
            ])
            ->where(function ($q) use ($finalStartDate, $finalEndDate) {
                $q->whereDate('start_date', '<=', $finalEndDate)
                    ->whereDate('end_date', '>=', $finalStartDate);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors([
                'date_conflict' => 'You already have a leave request or approved leave within the selected (or bridged) date range.',
            ]);
        }


        $requestedDays =
            LeaveService::calculateLeaveDays($finalStartDate, $finalEndDate);

        $defaultCasual = 20;
        $defaultMedical = 15;

        // Calculate used balance (Standard calculation now)
        $used = Leave::where('employee_id', $user->employee_id)
            ->where('type', $request->leave_type)
            ->whereIn('status', ['Sent to Registrar', 'Approved by Registrar', 'Approved by VC'])
            ->get()
            ->sum(
                fn($leave) =>
                LeaveService::calculateLeaveDays($leave->start_date, $leave->end_date)
            );

        $remaining = match ($request->leave_type) {
            'Casual Leave' => $defaultCasual - $used,
            'Medical Leave' => $defaultMedical - $used,
            'Duty Leave' => PHP_INT_MAX,
            default => PHP_INT_MAX,
        };

        if ($request->leave_type !== 'Duty Leave' && $requestedDays > $remaining) {
            return back()->withErrors([
                'balance' => "Requested {$requestedDays} days (including bridged holidays/weekends) exceeds remaining {$remaining} days.",
            ]);
        }


        $medicalPath = null;

        if ($request->hasFile('medical_file')) {
            $medicalPath = $request->file('medical_file')
                ->store('medical-certificates', 'public');
        }

        // Determine initial status based on whether user is a senior officer
        $initialStatus = $isSeniorOfficer ? 'Requested to VC' : 'Requested to Head';

        // Create the leave
        $leave = Leave::create([
            'employee_id' => $user->employee_id,
            'start_date' => $finalStartDate,
            'end_date' => $finalEndDate,
            'type' => $request->leave_type,
            'reason' => $request->reason,
            'replace' => $request->replace,
            'medical_file' => $medicalPath,
            'status' => $initialStatus,
        ]);

        $successMessage = $isSeniorOfficer
            ? 'Leave Requested Successfully.'
            : 'Leave Requested Successfully';
        
        if ($wasBridged) {
            $successMessage .= ' (Note: Dates were extended to include intervening holidays/weekends per Sandwich Rule)';
        }

        if ($isSeniorOfficer) {
            $successMessage .= ' Awaiting Vice Chancellor approval.';
        }

        return redirect()->route('leave.index')->with('success', $successMessage);
    }

    // 4️⃣ User cancels leave (Directly if not processed)
    public function cancelByUser($id)
    {
        $leave = Leave::findOrFail($id);
        $user = Auth::user();

        if ($leave->employee_id !== $user->employee_id) {
            abort(403, 'Unauthorized');
        }

        if (in_array($leave->status, ['Requested to Head', 'Requested to VC'])) {
            $leave->delete();
            return back()->with('success', 'Leave request cancelled.');
        }

        return back()->withErrors(['cancel_error' => 'Cannot delete processed leave. Request cancellation instead.']);
    }

    // 5️⃣ User requests cancellation (If already approved/forwarded)
    public function requestCancellation($id)
    {
        $leave = Leave::findOrFail($id);
        $user = Auth::user();

        if ($leave->employee_id !== $user->employee_id) {
            abort(403, 'Unauthorized');
        }

        if (in_array($leave->status, ['Sent to Registrar', 'Approved by Registrar', 'Approved by VC'])) {
            $leave->update(['status' => 'Cancellation Requested']);
            return back()->with('success', 'Cancellation requested to Department Head.');
        }

        return back()->withErrors(['cancel_error' => 'Invalid status for cancellation request.']);
    }

    // 6️⃣ Head approves cancellation
    public function approveCancellation($id)
    {
        $leave = Leave::findOrFail($id);

        // Delete associated attendance records
        DailyAttendance::where('employee_id', $leave->employee_id)
            ->whereBetween('date', [$leave->start_date, $leave->end_date])
            ->delete();

        // Delete the leave record (or we could soft delete / mark as Cancelled)
        $leave->delete();

        return back()->with('success', 'Leave cancellation approved and records deleted.');
    }

    // 7️⃣ Head denies cancellation
    public function denyCancellation($id)
    {
        $leave = Leave::findOrFail($id);

        // Revert to 'Approved by Registrar' as a safe default for active leaves
        $leave->update(['status' => 'Approved by Registrar']);

        return back()->with('success', 'Cancellation request denied. Leave remains active.');
    }
}

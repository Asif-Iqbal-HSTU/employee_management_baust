<?php

namespace App\Http\Controllers;

use App\Models\Worklog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class WorklogController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $worklogs = Worklog::where('employee_id', $user->employee_id)
            ->orderBy('date', 'desc')
            ->get();

        $departments = \App\Models\Department::all(); // assuming dept list needed
        return inertia('Worklog/deptList', [
            'departments' => $departments,
            'worklogs' => $worklogs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'startTime' => 'nullable|date_format:H:i',
            'endTime' => 'nullable|date_format:H:i',
            'taskDescription' => 'required|string',
            'status' => 'nullable|string',
        ]);

        Worklog::create([
            'employee_id' => Auth::user()->employee_id,
            'date' => $validated['date'],
            'startTime' => $validated['startTime'] ?? null,
            'endTime' => $validated['endTime'] ?? null,
            'taskDescription' => $validated['taskDescription'],
            'status' => $validated['status'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Worklog added successfully!');
    }

    public function showEmployees($deptId)
    {
        $department = DB::table('departments')->where('id', $deptId)->first();

        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->where('user_assignments.department_id', $deptId)
            ->select(
                'users.employee_id',
                'users.name',
                'designations.designation_name as designation'
            )
            ->get();

        return Inertia::render('Worklog/EmployeeList', [
            'department' => $department,
            'employees' => $employees,
        ]);
    }

    // Fetch worklogs of a specific employee (AJAX)
    public function getEmployeeWorklogs($employeeId)
    {
        $worklogs = Worklog::where('employee_id', $employeeId)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($worklogs);
    }
}

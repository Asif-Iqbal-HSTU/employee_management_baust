<?php

namespace App\Http\Controllers;

use App\Models\DeptHead;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DeptHeadController extends Controller
{
    public function index()
    {
        $deptHeads = DeptHead::with(['department', 'user'])
            ->get()
            ->map(function ($head) {
                return [
                    'id' => $head->id,
                    'department_id' => $head->department_id,
                    'department_name' => $head->department->dept_name ?? 'Unknown',
                    'employee_id' => $head->employee_id,
                    'employee_name' => $head->user->name ?? 'Unknown',
                ];
            });

        $departments = Department::orderBy('dept_name')->get(['id', 'dept_name']);

        $employees = DB::table('users')
            ->join('user_assignments', 'users.employee_id', '=', 'user_assignments.employee_id')
            ->leftJoin('designations', 'designations.id', '=', 'user_assignments.designation_id')
            ->leftJoin('departments', 'departments.id', '=', 'user_assignments.department_id')
            ->select(
                'users.employee_id',
                'users.name',
                'designations.designation_name as designation',
                'departments.dept_name as department'
            )
            ->orderBy('users.name')
            ->get();

        return Inertia::render('Admin/DeptHeads', [
            'deptHeads' => $deptHeads,
            'departments' => $departments,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'employee_id' => 'required|exists:users,employee_id',
        ]);

        // Check if this combination already exists
        $exists = DeptHead::where('department_id', $request->department_id)
            ->where('employee_id', $request->employee_id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['duplicate' => 'This employee is already a head of this department.']);
        }

        DeptHead::create([
            'department_id' => $request->department_id,
            'employee_id' => $request->employee_id,
        ]);

        return back()->with('success', 'Department head added successfully.');
    }

    public function update(Request $request, DeptHead $deptHead)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'employee_id' => 'required|exists:users,employee_id',
        ]);

        // Check if the new combination already exists (excluding current record)
        $exists = DeptHead::where('department_id', $request->department_id)
            ->where('employee_id', $request->employee_id)
            ->where('id', '!=', $deptHead->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['duplicate' => 'This employee is already a head of this department.']);
        }

        $deptHead->update([
            'department_id' => $request->department_id,
            'employee_id' => $request->employee_id,
        ]);

        return back()->with('success', 'Department head updated successfully.');
    }

    public function destroy(DeptHead $deptHead)
    {
        $deptHead->delete();

        return back()->with('success', 'Department head removed successfully.');
    }
}

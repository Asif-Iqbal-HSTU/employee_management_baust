<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Designation;
use App\Models\EmployeeDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HRController extends Controller
{
    public function employeeList(Request $request)
    {
        // Access control: only employee_id 25052 for now
        if (auth()->user()->employee_id !== '25052') {
            abort(403);
        }

        $query = User::query()->with(['assignment.department', 'assignment.designation', 'employeeDetail']);

        // Search/Filters
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($request->department_id) {
            $query->whereHas('assignment', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->designation_id) {
            $query->whereHas('assignment', function ($q) use ($request) {
                $q->where('designation_id', $request->designation_id);
            });
        }

        if ($request->employment_type) {
            $query->whereHas('employeeDetail', function ($q) use ($request) {
                $q->where('employment_type', $request->employment_type);
            });
        }

        $employees = $query->paginate(20)->withQueryString();

        return Inertia::render('HR/EmployeeList', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'department_id', 'designation_id', 'employment_type']),
            'departments' => Department::all(['id', 'dept_name']),
            'designations' => Designation::all(['id', 'designation_name']),
            'employmentTypes' => EmployeeDetail::whereNotNull('employment_type')->distinct()->pluck('employment_type'),
        ]);
    }
}

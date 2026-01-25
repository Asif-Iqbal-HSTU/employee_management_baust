<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Department;
use App\Models\Designation;
use App\Models\UserAssignment;

class UserAssignmentController extends Controller
{
    public function index()
    {
        $users = User::with('assignment.department', 'assignment.designation')->get();
        $departments = Department::all();
        $designations = Designation::all();

        return inertia('UserAssignments/Index', [
            'users' => $users,
            'departments' => $departments,
            'designations' => $designations,
        ]);
    }

    /*public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|string|exists:users,employee_id',
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
        ]);

        UserAssignment::updateOrCreate(
            ['employee_id' => $validated['employee_id']],
            [
                'department_id' => $validated['department_id'],
                'designation_id' => $validated['designation_id'],
            ]
        );

        return response()->json(['success' => true]);
    }*/

    /*public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|string|exists:users,employee_id',
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
        ]);

        $assignment = UserAssignment::where('employee_id', $validated['employee_id'])->first();

        if ($assignment) {
            // ✅ Update existing record
            $assignment->update([
                'department_id' => $validated['department_id'],
                'designation_id' => $validated['designation_id'],
            ]);
        } else {
            // ✅ Create new record
            UserAssignment::create([
                'employee_id' => $validated['employee_id'],
                'department_id' => $validated['department_id'],
                'designation_id' => $validated['designation_id'],
            ]);
        }

        return response()->json(['success' => true]);
    }*/

    public function store(Request $request)
    {
        $assignment = UserAssignment::where('employee_id', $request->employee_id)->first();

        if ($assignment) {
            // ✅ Update existing record
            $assignment->update([
                'department_id' => $request->department_id,
                'designation_id' => $request->designation_id,
            ]);
        } else {
            // ✅ Create new record
            UserAssignment::create([
                'employee_id' => $request->employee_id,
                'department_id' => $request->department_id,
                'designation_id' => $request->designation_id,
            ]);
        }

    }

    public function destroy(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|string|exists:user_assignments,employee_id',
        ]);

        UserAssignment::where('employee_id', $request->employee_id)->delete();

        return response()->json(['success' => true]);
    }
}


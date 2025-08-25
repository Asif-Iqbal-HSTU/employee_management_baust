<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DeptHead;
use App\Models\TimeAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeAssignmentController extends Controller
{
    public function index()
    {
        $head = DeptHead::where('employee_id', auth()->user()->employee_id)->firstOrFail();
        $departmentUsers = User::whereHas('assignment', function ($q) use ($head) {
            $q->where('department_id', $head->department_id);
        })->get();

        $assignments = TimeAssignment::with('user')
            ->whereIn('employee_id', $departmentUsers->pluck('employee_id'))
            ->get();

        return Inertia::render('TimeAssignments/Index', [
            'users' => $departmentUsers,
            'assignments' => $assignments,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id'   => 'required|exists:users,employee_id',
            'allowed_entry' => 'nullable|date_format:H:i',
            'allowed_exit'  => 'nullable|date_format:H:i|after:allowed_entry',
            'weekdays'      => 'required|array|min:1',
            'weekdays.*'    => 'in:sun,mon,tue,wed,thu,fri,sat',
            'loop'          => 'boolean',
        ]);

        TimeAssignment::updateOrCreate(
            ['employee_id' => $data['employee_id']],
            $data
        );

        return redirect()->back()->with('success', 'Time assigned successfully.');
    }


    public function destroy(TimeAssignment $timeAssignment)
    {
        $timeAssignment->delete();
        return redirect()->back()->with('success', 'Assignment deleted.');
    }
}



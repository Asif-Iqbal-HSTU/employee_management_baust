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
}

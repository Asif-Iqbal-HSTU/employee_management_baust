<?php

namespace App\Http\Controllers;

use App\Models\DutyRoster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
//use Auth;
use Carbon\Carbon;

class DutyRosterController extends Controller
{
    public function index()
    {
        return Inertia::render('DutyRoster/Index');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_ids' => 'required|array',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date|after_or_equal:start_date',
            'start_time'   => 'required',
            'end_time'     => 'required',
            'reason'       => 'nullable|string',
        ]);

        $dates = Carbon::parse($data['start_date'])
            ->daysUntil($data['end_date']);

        foreach ($data['employee_ids'] as $empId) {
            foreach ($dates as $date) {
                DutyRoster::updateOrCreate(
                    [
                        'employee_id' => $empId,
                        'date' => $date->format('Y-m-d'),
                    ],
                    [
                        'start_time' => $data['start_time'],
                        'end_time'   => $data['end_time'],
                        'reason'     => $data['reason'],
                        'created_by' => Auth::user()->employee_id,
                    ]
                );
            }
        }

        return back()->with('success', 'Duty roster saved successfully.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\DutyRoster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
//use Auth;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DutyRosterController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user->employee_id === '25052';
        $deptHead = DB::table('dept_heads')->where('employee_id', $user->employee_id)->first();

        if (!$isAdmin && !$deptHead) {
            abort(403, 'Unauthorized access.');
        }

        $query = User::query()->with('assignment.department');

        if (!$isAdmin) {
            $query->whereHas('assignment', function ($q) use ($deptHead) {
                $q->where('department_id', $deptHead->department_id);
            });
        }

        $employees = $query->get()->map(function ($emp) {
            return [
                'employee_id' => $emp->employee_id,
                'name' => $emp->name,
                'department' => $emp->assignment->department->name ?? 'N/A',
            ];
        });

        $rosters = DutyRoster::with([
            'user' => function ($q) {
                $q->select('employee_id', 'name');
            }
        ])
            ->when(!$isAdmin, function ($q) use ($deptHead) {
                $q->whereHas('user.assignment', function ($sq) use ($deptHead) {
                    $sq->where('department_id', $deptHead->department_id);
                });
            })
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'asc')
            ->paginate(20);

        return Inertia::render('DutyRoster/Index', [
            'employees' => $employees,
            'rosters' => $rosters,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_ids' => 'required|array',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required',
            'end_time' => 'required',
            'reason' => 'nullable|string',
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
                        'end_time' => $data['end_time'],
                        'reason' => $data['reason'],
                        'created_by' => Auth::user()->employee_id,
                    ]
                );
            }
        }

        return back()->with('success', 'Duty roster saved successfully.');
    }

    public function securityIndex(Request $request)
    {
        $weekStart = $request->input('week_start', Carbon::now()->startOfWeek(Carbon::FRIDAY)->format('Y-m-d'));
        $weekEnd = Carbon::parse($weekStart)->addDays(6)->format('Y-m-d');

        // Designation ID 68 is Security Guard
        $guards = User::whereHas('assignment', function ($q) {
            $q->where('designation_id', 68);
        })->get(['employee_id', 'name']);

        $existingRosters = DutyRoster::whereIn('employee_id', $guards->pluck('employee_id'))
            ->whereBetween('date', [$weekStart, $weekEnd])
            ->get();

        $isFinalized = $existingRosters->contains('is_finalized', true);
        $isAdmin = Auth::user()->employee_id == '25052';

        return Inertia::render('DutyRoster/SecurityIndex', [
            'guards' => $guards,
            'existingRosters' => $existingRosters,
            'currentWeekStart' => $weekStart,
            'isFinalized' => $isFinalized,
            'isAdmin' => $isAdmin
        ]);
    }

    public function securityStore(Request $request)
    {
        $request->validate([
            'entries' => 'required|array',
            'entries.*.employee_id' => 'required|string',
            'entries.*.date' => 'required|date',
            'entries.*.start_time' => 'required',
            'entries.*.end_time' => 'required',
        ]);

        $isAdmin = Auth::user()->employee_id == '25052';

        // Check if any existing entries for these dates are finalized
        $dates = collect($request->entries)->pluck('date')->unique();
        $isFinalized = DutyRoster::whereIn('date', $dates)->where('is_finalized', true)->exists();

        if ($isFinalized && !$isAdmin) {
            return back()->with('error', 'This week is finalized and cannot be edited.');
        }

        DB::transaction(function () use ($request) {
            foreach ($request->entries as $entry) {
                DutyRoster::updateOrCreate(
                    [
                        'employee_id' => $entry['employee_id'],
                        'date' => $entry['date'],
                    ],
                    [
                        'start_time' => $entry['start_time'],
                        'end_time' => $entry['end_time'],
                        'created_by' => Auth::user()->employee_id,
                    ]
                );
            }
        });

        return back()->with('success', 'Weekly duty roster saved successfully.');
    }

    public function securityFinalize(Request $request)
    {
        if (Auth::user()->employee_id != '25052') {
            abort(403);
        }

        $request->validate([
            'week_start' => 'required|date',
            'finalize' => 'required|boolean'
        ]);

        $weekStart = $request->week_start;
        $weekEnd = Carbon::parse($weekStart)->addDays(6)->format('Y-m-d');

        DutyRoster::whereBetween('date', [$weekStart, $weekEnd])
            ->update(['is_finalized' => $request->finalize]);

        $status = $request->finalize ? 'finalized' : 'unfinalized';
        return back()->with('success', "Weekly duty roster {$status} successfully.");
    }
    public function weeklyIndex()
    {
        $user = Auth::user();
        $isAdmin = $user->employee_id === '25052';
        $deptHead = DB::table('dept_heads')->where('employee_id', $user->employee_id)->first();

        if (!$isAdmin && !$deptHead) {
            abort(403, 'Unauthorized access.');
        }

        $query = User::query()->with('assignment.department');

        if (!$isAdmin) {
            $query->whereHas('assignment', function ($q) use ($deptHead) {
                $q->where('department_id', $deptHead->department_id);
            });
        }

        $employees = $query->get()->map(function ($emp) {
            return [
                'employee_id' => $emp->employee_id,
                'name' => $emp->name,
                'department' => $emp->assignment->department->name ?? 'N/A',
            ];
        });

        // 💡 Fetch upcoming rosters for context
        $rosters = DutyRoster::with([
            'user' => function ($q) {
                $q->select('employee_id', 'name');
            }
        ])
            ->when(!$isAdmin, function ($q) use ($deptHead) {
                $q->whereHas('user.assignment', function ($sq) use ($deptHead) {
                    $sq->where('department_id', $deptHead->department_id);
                });
            })
            ->whereDate('date', '>=', Carbon::today())
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->paginate(20);

        return Inertia::render('DutyRoster/Weekly', [
            'employees' => $employees,
            'rosters' => $rosters,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function weeklyStore(Request $request)
    {
        $data = $request->validate([
            'employee_ids' => 'required|array|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'schedule' => 'required|array',
            'schedule.*.day' => 'required|string',
            'schedule.*.active' => 'required|boolean',
            'schedule.*.start_time' => 'required_if:schedule.*.active,true',
            'schedule.*.end_time' => 'required_if:schedule.*.active,true',
        ]);

        $dates = Carbon::parse($data['start_date'])
            ->daysUntil($data['end_date']);

        $activeDays = collect($data['schedule'])->where('active', true)->keyBy('day');

        if ($activeDays->isEmpty()) {
            return back()->withErrors(['schedule' => 'At least one day must be active.']);
        }

        DB::transaction(function () use ($data, $dates, $activeDays) {
            foreach ($data['employee_ids'] as $empId) {
                foreach ($dates as $date) {
                    $dayName = $date->format('l'); // e.g., Monday

                    if ($activeDays->has($dayName)) {
                        $schedule = $activeDays->get($dayName);
                        
                        DutyRoster::updateOrCreate(
                            [
                                'employee_id' => $empId,
                                'date' => $date->format('Y-m-d'),
                            ],
                            [
                                'start_time' => $schedule['start_time'],
                                'end_time' => $schedule['end_time'],
                                'reason' => 'Weekly Roster',
                                'created_by' => Auth::user()->employee_id,
                            ]
                        );
                    }
                }
            }
        });

        return back()->with('success', 'Weekly duty roster saved successfully.');
    }
    public function destroy(DutyRoster $roster)
    {
        $user = Auth::user();
        $isAdmin = $user->employee_id === '25052';
        
        // If not created by user and not admin, check dept head status
        if ($roster->created_by != $user->employee_id && !$isAdmin) {
             $deptHead = DB::table('dept_heads')->where('employee_id', $user->employee_id)->first();
             if ($deptHead) {
                 // Check if the roster belongs to an employee in this dept
                 $rosterUser = User::with('assignment')->where('employee_id', $roster->employee_id)->first();
                 if (!$rosterUser || !$rosterUser->assignment || $rosterUser->assignment->department_id != $deptHead->department_id) {
                     abort(403, 'Unauthorized action.');
                 }
             } else {
                 abort(403, 'Unauthorized action.');
             }
        }

        $roster->delete();
        return back()->with('success', 'Roster entry deleted successfully.');
    }
}

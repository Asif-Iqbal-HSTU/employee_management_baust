<?php

namespace App\Http\Controllers;

use App\Models\RepairRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RepairRequestController extends Controller
{
    public function index0()
    {
        $requests = RepairRequest::latest()->paginate(10);
        return Inertia::render('Repair/Index', [
            'requests' => $requests
        ]);
    }

    public function index1()
    {
        $user = auth()->user();

        // If IT Cell Admin (employee_id = 25052), show all requests
        if ($user->employee_id === '25052') {
            $requests = RepairRequest::latest()->paginate(10);
        } else {
            // Otherwise, show only the requests submitted by this user
            $requests = RepairRequest::where('employee_id', $user->employee_id)
                ->latest()
                ->paginate(10);
        }

        return Inertia::render('Repair/Index', [
            'requests' => $requests,
        ]);
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $query = RepairRequest::latest();

        // Check if user wants to see only their own requests (?mine=1)
        if ($request->query('mine') === '1') {
            $query->where('employee_id', $user->employee_id);
        } else {
            // Visibility logic for all requests (IT Cell, HOD, or regular user)
            if ($this->isRepairAdmin($user)) {
                // IT Admin - sees everything
            } elseif ($user->headedDepartment && $user->headedDepartment->count() > 0) {
                // HOD - sees their own + department requests
                $deptNames = $user->headedDepartment->map(fn($h) => $h->department->dept_name)->toArray();
                $deptShortNames = $user->headedDepartment->map(fn($h) => $h->department->short_name)->filter()->toArray();
                $allNames = array_merge($deptNames, $deptShortNames);
                $query->where(function ($q) use ($user, $allNames) {
                    $q->where('employee_id', $user->employee_id)
                        ->orWhereIn('department', $allNames);
                });
            } else {
                // Regular User - sees only their own
                $query->where('employee_id', $user->employee_id);
            }
        }

        $requests = $query->paginate(10)->withQueryString();

        return Inertia::render('Repair/Index', [
            'requests' => $requests,
            'isMine' => $request->query('mine') === '1'
        ]);
    }


    public function create()
    {
        $user = auth()->user();
        $assignment = \App\Models\UserAssignment::with(['department', 'designation'])
            ->where('employee_id', $user->employee_id)
            ->first();

        return Inertia::render('Repair/Create', [
            'autoDepartment' => $assignment && $assignment->department ? $assignment->department->dept_name : '',
            'autoDesignation' => $assignment && $assignment->designation ? $assignment->designation->designation_name : '',
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'department' => 'required|string',
            'submission_date' => 'required|date',
            'submission_time' => 'nullable',
            'contact_person' => 'required|string',
            'designation' => 'nullable|string',
            'contact_no' => 'required|string',
            'email' => 'nullable|email',
            'device_type' => 'required|string',
            'brand_model' => 'nullable|string',
            'asset_id' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'accessories' => 'array|nullable',
            'problem_description' => 'nullable|string',
        ]);

        $now = now();
        $data['employee_id'] = auth()->user()->employee_id;
        $data['job_id'] = $now->format('YdmHi');

        RepairRequest::create($data);

        return redirect()->route('repair.index')->with('success', 'Repair request submitted successfully.');
    }

    public function downloadPdf(RepairRequest $repairRequest)
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.repair_request', ['request' => $repairRequest]);
        return $pdf->download('repair_request_' . $repairRequest->job_id . '.pdf');
    }

    public function updateStatus(Request $request, RepairRequest $repairRequest)
    {
        if (!$this->isRepairAdmin(auth()->user())) {
            abort(403, 'Unauthorized.');
        }

        $repairRequest->update($request->validate([
            'status' => 'required|in:Pending,In Progress,Completed,Delivered',
            'state' => 'nullable|string',
            'completed_actions' => 'nullable|string',
            'initial_observation' => 'nullable|string',
            'assigned_to' => 'nullable|string',
            'assigned_phone' => 'nullable|string',
            'expected_delivery' => 'nullable|date',
        ]));

        return back()->with('success', 'Status updated.');
    }

    // app/Http/Controllers/RepairRequestController.php
    public function edit(RepairRequest $repairRequest)
    {
        return Inertia::render('Repair/Edit', [
            'request' => $repairRequest,
        ]);
    }

    public function update(Request $request, RepairRequest $repairRequest)
    {
        if (!$this->isRepairAdmin(auth()->user())) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'job_id' => 'nullable|string|max:50',
            'date_received' => 'nullable|date',
            'received_by' => 'nullable|string|max:100',
            'initial_observation' => 'nullable|string',
            'expected_delivery' => 'nullable|date',
            'assigned_to' => 'nullable|string|max:100',
            'assigned_phone' => 'nullable|string|max:50',
            'status' => 'required|in:Pending,In Progress,Completed,Delivered',
            'state' => 'nullable|string',
            'completed_actions' => 'nullable|string',
        ]);

        $repairRequest->update($validated);

        return redirect()->route('repair.index')->with('success', 'Repair Cell details updated successfully.');
    }

    public function view($id)
    {
        $request = RepairRequest::findOrFail($id);
        return inertia('Repair/View', [
            'request' => $request
        ]);
    }


    private function isRepairAdmin($user)
    {
        $adminIds = ['25052', '21023', '25030', '24079', '25048'];
        return in_array($user->employee_id, $adminIds);
    }
}


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

        if ($request->has('mine')) {
            $requests = RepairRequest::where('employee_id', $user->employee_id)
                ->latest()
                ->paginate(10);
        } elseif ($user->employee_id === '25052') {
            $requests = RepairRequest::latest()->paginate(10);
        } else {
            $requests = RepairRequest::where('employee_id', $user->employee_id)
                ->latest()
                ->paginate(10);
        }

        return Inertia::render('Repair/Index', [
            'requests' => $requests,
        ]);
    }


    public function create()
    {
        return Inertia::render('Repair/Create');
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

        $data['employee_id'] = auth()->id();
        $data['job_id'] = 'JOB-' . strtoupper(Str::random(6));

        RepairRequest::create($data);

        return redirect()->route('repair.index')->with('success', 'Repair request submitted successfully.');
    }

    public function updateStatus(Request $request, RepairRequest $repairRequest)
    {
        $repairRequest->update($request->validate([
            'status' => 'required|in:Pending,In Progress,Completed,Delivered',
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
        $validated = $request->validate([
            'job_id' => 'nullable|string|max:50',
            'date_received' => 'nullable|date',
            'received_by' => 'nullable|string|max:100',
            'initial_observation' => 'nullable|string',
            'expected_delivery' => 'nullable|date',
            'assigned_to' => 'nullable|string|max:100',
            'assigned_phone' => 'nullable|string|max:50',
            'status' => 'required|in:Pending,In Progress,Completed,Delivered',
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


}


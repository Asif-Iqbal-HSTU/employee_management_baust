<?php

namespace App\Http\Controllers;

use App\Models\IssueVoucher;
use App\Models\Worklog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IssueVoucherController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $vouchers = IssueVoucher::where('requisition_employee_id', $user->employee_id)
            ->orderBy('date', 'desc')
            ->get();

        $departments = \App\Models\Department::all(); // assuming dept list needed
        return inertia('Worklog/deptList', [
            'worklogs' => $vouchers,
        ]);
    }
}

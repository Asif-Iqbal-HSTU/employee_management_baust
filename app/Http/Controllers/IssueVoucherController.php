<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\IssueVoucher;
use App\Models\StoreProduct;
use App\Models\Worklog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class IssueVoucherController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $products = StoreProduct::all();
        $departments = Department::all();
        $vouchers = IssueVoucher::where('requisition_employee_id', $user->employee_id)
            ->with('product')
            ->orderBy('date', 'desc')
            ->get();

        return inertia('Store/voucher', [
            'products' => $products,
            'vouchers' => $vouchers,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'requisition_employee_id' => 'required|exists:users,employee_id',
            'department_id' => 'required|exists:departments,id',
            'to_be_used_in' => 'required|exists:departments,id',
            'to_be_used_in_category' => 'required|string',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.store_product_id' => 'required|exists:store_products,id',
            'items.*.requisitioned_quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                IssueVoucher::create([
                    'store_product_id' => $item['store_product_id'],
                    'requisition_employee_id' => $request->requisition_employee_id,
                    'department_id' => $request->department_id,
                    'to_be_used_in' => $request->to_be_used_in,
                    'to_be_used_in_category' => $request->to_be_used_in_category,
                    'date' => $request->date,
                    'requisitioned_quantity' => $item['requisitioned_quantity'],
                ]);
            }
        });

        return back()->with('success', 'Vouchers created successfully.');
    }

    public function depthead_allow(Request $request)
    {
        $user = Auth::user();

        // 1️⃣ Verify user is a department head
        $deptHead = DB::table('dept_heads')
            ->join('departments', 'dept_heads.department_id', '=', 'departments.id')
            ->where('dept_heads.employee_id', $user->employee_id)
            ->select('dept_heads.*', 'departments.dept_name')
            ->first();

        if (!$deptHead) {
            abort(403, 'You are not a department head');
        }

        $departmentId = $deptHead->department_id;
        $departmentName = $deptHead->dept_name;

        // 2️⃣ Get vouchers belonging to that department
        $pending = IssueVoucher::where('department_id', $departmentId)
            ->where('allowed_by_head', 'No')
            ->with('product', 'requisitionedBy')
            ->orderBy('date', 'desc')
            ->get();

        $allowed = IssueVoucher::where('department_id', $departmentId)
            ->where('allowed_by_head', 'Yes')
            ->with('product', 'requisitionedBy')
            ->orderBy('date', 'desc')
            ->get();

        return inertia('DeptHead/VoucherAllow', [
            'department' => [
                'id' => $departmentId,
                'name' => $departmentName,
            ],
            'pending' => $pending,
            'allowed' => $allowed,
        ]);
    }

    public function approveByHead(IssueVoucher $voucher)
    {
        $voucher->update([
            'allowed_by_head' => 'Yes'
        ]);

        return back()->with('success', 'Voucher approved successfully.');
    }

    /**
     * Bulk approves vouchers for a specific employee on a specific date.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkApproveByHead(Request $request)
    {

        //dd($request->all());
        // 1. Validate the request data
        $request->validate([
            'employee_id' => 'required|integer',
            'date' => 'required|date_format:Y-m-d', // Assuming 'Y-m-d' date format
        ]);

        $employeeId = $request->input('employee_id');
        $date = $request->input('date');

        $user = Auth::user();

        // 2. Determine the department ID of the current head
        $deptHead = DB::table('dept_heads')
            ->where('employee_id', $user->employee_id)
            ->first();

        if (!$deptHead) {
            // Should be caught earlier, but good to have a check
            return back()->with('error', 'Authentication error: Not a department head.');
        }

        $departmentId = $deptHead->department_id;

        // 3. Perform the bulk update
        $updatedCount = IssueVoucher::where('department_id', $departmentId)
            ->where('requisition_employee_id', $employeeId)
            ->where('date', $date)
            ->where('allowed_by_head', 'No') // Only update pending vouchers
            ->update([
                'allowed_by_head' => 'Yes',
                // You might also want to set an approved_by_head_id/timestamp here
                // 'approved_by_head_id' => $user->employee_id,
            ]);

        if ($updatedCount > 0) {
            return back()->with('success', "$updatedCount vouchers approved successfully for employee $employeeId on $date.");
        }

        return back()->with('error', 'No pending vouchers found to approve with the given criteria.');
    }


}

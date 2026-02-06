<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\IssueVoucher;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrarVoucherController extends Controller
{
    public function index()
    {
        $vouchers = IssueVoucher::with(['requisitionedBy.assignment.designation', 'department', 'product'])
            ->where('allowed_by_head', 'Yes')
            ->where('allowed_by_registrar', 'No')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Store/registrar', [
            'vouchers' => $vouchers
        ]);
    }

    public function finalized()
    {
        $vouchers = IssueVoucher::with(['requisitionedBy.assignment.designation', 'department', 'product'])
            ->whereIn('allowed_by_registrar', ['Yes', 'Rejected'])
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return Inertia::render('Store/FinalizedVouchers', [
            'vouchers' => $vouchers
        ]);
    }


    // Registrar approves
    public function approve(Request $request, $id)
    {
        $voucher = IssueVoucher::findOrFail($id);

        $updateData = [
            'allowed_by_registrar' => 'Yes'
        ];

        if ($request->has('requisitioned_quantity')) {
            $updateData['requisitioned_quantity'] = $request->requisitioned_quantity;
        }

        $voucher->update($updateData);

        return back()->with('success', 'Voucher Approved Successfully');
    }

    // Registrar rejects
    public function deny($id)
    {
        $voucher = IssueVoucher::findOrFail($id);

        $voucher->update([
            'allowed_by_registrar' => 'Rejected'
        ]);

        return back()->with('success', 'Voucher Rejected');
    }

    // Bulk Update
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'status' => 'required|in:Yes,Rejected'
        ]);

        IssueVoucher::whereIn('id', $request->ids)
            ->where('allowed_by_head', 'Yes')
            ->where('allowed_by_registrar', 'No')
            ->update(['allowed_by_registrar' => $request->status]);

        return back()->with('success', 'Vouchers updated successfully');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\IssueVoucher;
use App\Models\StoreIssue;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Illuminate\Support\Arr;

class StoreIssueController extends Controller
{
    public function storeman_index0()
    {
        $vouchers = IssueVoucher::where('allowed_by_head', 'Yes')
            ->where('issued_by_storeman', 'No')
            ->with(['product', 'requisitionedBy', 'department'])
            ->orderBy('date', 'asc')
            ->get();

        $issued = IssueVoucher::where('issued_by_storeman', 'Yes')
            ->with(['product', 'department'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return inertia('Store/issue', [
            'pending' => $vouchers,
            'issued' => $issued,
        ]);
    }

    public function storeman_index()
    {
        $pending = IssueVoucher::where('allowed_by_head', 'Yes')
            ->where('issued_by_storeman', 'No')
            ->with(['product', 'requisitionedBy', 'department'])
            ->orderBy('date', 'asc')
            ->get();

        $issued = IssueVoucher::where('issued_by_storeman', 'Yes')
            ->with(['product', 'requisitionedBy', 'department'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $pendingGrouped = $pending->groupBy(function($item) {
            return $item->requisition_employee_id . '|' . $item->date;
        })->map(function($group) {
            return [
                'employee_id' => $group->first()->requisition_employee_id,
                'employee_name' => $group->first()->requisitionedBy->name ?? 'N/A',
                'date' => $group->first()->date,
                'items' => $group->values(),
            ];
        })->values();

        $issuedGrouped = $issued->groupBy(function($item) {
            return $item->requisition_employee_id . '|' . $item->date;
        })->map(function($group) {
            return [
                'employee_id' => $group->first()->requisition_employee_id,
                'employee_name' => $group->first()->requisitionedBy->name ?? 'N/A',
                'date' => $group->first()->date,
                'items' => $group->values(),
            ];
        })->values();

        return inertia('Store/issue', [
            'pendingGrouped' => $pendingGrouped,
            'issuedGrouped' => $issuedGrouped,
        ]);
    }


    public function export($employee_id, $date)
    {
        $vouchers = IssueVoucher::where('requisition_employee_id', $employee_id)
            ->where('date', $date)
            ->with('product', 'requisitionedBy')
            ->get();

        $employee = $vouchers->first()->requisitionedBy ?? null;

        return view('pdf.issue-voucher', [
            'employee' => $employee,
            'date' => $date,
            'vouchers' => $vouchers,
        ]);
    }


    public function storeman_issue(Request $request, IssueVoucher $voucher)
    {
        $request->validate([
            'sl_no'           => 'required|string',
            'book_no'         => 'required|string',
            'receiver'        => 'required|string',
            'issued_quantity' => 'required|integer|min:1',
            'specification'   => 'nullable|string',
            'budget_code'     => 'nullable|string',
        ]);

        $product = StoreProduct::findOrFail($voucher->store_product_id);

        // ❌ Prevent issuing more than stock
        if ($request->issued_quantity > $product->stock_unit_number) {
            return back()->withErrors([
                'issued_quantity' => 'Insufficient stock available.',
            ]);
        }

        // ❌ Prevent issuing more than requested
        if ($request->issued_quantity > $voucher->requisitioned_quantity) {
            return back()->withErrors([
                'issued_quantity' => 'Issued quantity exceeds requisitioned quantity.',
            ]);
        }

        DB::transaction(function () use ($request, $voucher, $product) {

            // 1️⃣ Update Issue Voucher
            $voucher->update([
                'sl_no' => $request->sl_no,
                'book_no' => $request->book_no,
                'receiver' => $request->receiver,
                'issued_quantity' => $request->issued_quantity,
                'specification' => $request->specification,
                'issued_by_storeman' => 'Yes',
            ]);

            // 2️⃣ Create Store Issue Record
            StoreIssue::create([
                'store_product_id' => $voucher->store_product_id,
                'issue_voucher_id' => $voucher->id,
                'date_of_issue' => now()->toDateString(),
                'issued_quantity' => $request->issued_quantity,
                'budget_code' => $request->budget_code,
            ]);

            // 3️⃣ Reduce Stock
            $product->decrement('stock_unit_number', $request->issued_quantity);
        });

        return back()->with('success', 'Item issued successfully.');
    }

    public function printStockRegister(StoreProduct $product)
    {
        $product->load([
            'storeCategory',
            'receives',
            'issues.voucher.department',
            'issues.voucher.requisitionedBy',
        ]);

        $pdf = Pdf::loadView('pdf.stock-register', [
            'product' => $product,
            'date'    => now()->format('d-m-Y'),
        ])->setPaper('legal', 'landscape');

        return $pdf->stream(
            'stock-register-' . $product->id . '.pdf'
        );
    }

    /**
     * Renders the Issue Voucher Blade view as HTML for the preview modal.
     */
    public function previewVoucher($employee_id, $date)
    {
        $vouchers = IssueVoucher::where('requisition_employee_id', $employee_id)
            ->where('date', $date)
            ->where('issued_by_storeman', 'Yes') // 💡 Ensure only issued vouchers are previewed
            ->with(['product', 'requisitionedBy', 'department'])
            ->get();

        if ($vouchers->isEmpty()) {
            // Return an empty response or a simple error message
            return response()->json(['html' => '<h2>No issued items found for this group.</h2>'], 404);
        }

        // Get common data from the first voucher, load department relation
        $firstVoucher = $vouchers->first();
        $firstVoucher->load('department');

        // Return the rendered Blade view HTML
        return response()->json([
            'html' => view('pdf.issue-voucher', [
                'employee' => $firstVoucher->requisitionedBy ?? null,
                'department' => $firstVoucher->department ?? null,
                'date' => $date,
                'vouchers' => $vouchers,
            ])->render()
        ]);
    }


    /**
     * Generates and streams the PDF file.
     */
    public function streamVoucherPdf($employee_id, $date)
    {
        $vouchers = IssueVoucher::where('requisition_employee_id', $employee_id)
            ->where('date', $date)
            ->where('issued_by_storeman', 'Yes') // 💡 Ensure only issued vouchers are streamed
            ->with(['product', 'requisitionedBy', 'department'])
            ->get();

        if ($vouchers->isEmpty()) {
            abort(404, 'No issued vouchers found for this group.');
        }

        $firstVoucher = $vouchers->first();
        $firstVoucher->load('department');


        $pdf = Pdf::loadView('pdf.issue-voucher', [
            'employee' => $firstVoucher->requisitionedBy ?? null,
            'department' => $firstVoucher->department ?? null,
            'date' => $date,
            'vouchers' => $vouchers,
        ]);

        return $pdf->stream(
            "issue-voucher-{$employee_id}-{$date}.pdf"
        );
    }



}

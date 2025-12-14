<?php

namespace App\Http\Controllers;

use App\Models\IssueVoucher;
use App\Models\StoreIssue;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class StoreIssueController extends Controller
{
    public function storeman_index()
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



}

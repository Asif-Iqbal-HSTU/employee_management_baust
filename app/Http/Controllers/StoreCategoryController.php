<?php

namespace App\Http\Controllers;

use App\Models\ProductVendor;
use App\Models\RepairRequest;
use App\Models\StoreCategory;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoreCategoryController extends Controller
{
    public function index0()
    {
        $categories = StoreCategory::all();
//        dd($categories);
        return inertia('Store/categoryandproduct', [
            'categories' => $categories,
        ]);
    }

    public function index(Request $request)
    {
        $categories = StoreCategory::all();

        $products = [];

        if ($request->filled('search')) {
            $products = StoreProduct::with('storeCategory:id,category_name')
                ->where('product_name', 'like', '%' . $request->search . '%')
                ->orderBy('product_name')
                ->limit(20)
                ->get([
                    'id',
                    'store_category_id',
                    'product_name',
                    'stock_unit_number',
                ]);
        }

        return inertia('Store/categoryandproduct', [
            'categories' => $categories,
            'products'   => $products,
            'filters'    => $request->only('search'),
        ]);
    }


    /*public function products($id)
    {
        $category = StoreCategory::find($id);
        $products = StoreProduct::where('store_category_id', $id)->get();
        return inertia('Store/productsofcategory', [
            'category' => $category,
            'products' => $products,
        ]);
    }*/

    public function products($id)
    {
        $category = StoreCategory::findOrFail($id);

        $products = StoreProduct::with([
            // Received Articles
            'receives:id,store_product_id,date_of_receive,from_whom,memo_no,memo_date,office_order_no,rate,quantity,warranty_information',

            // Issued Articles
            'issues:id,store_product_id,issue_voucher_id,date_of_issue,issued_quantity,budget_code',
            'issues.voucher:id,store_product_id,requisition_employee_id,receiver,department_id,date,issued_quantity,sl_no,book_no',
            'issues.voucher.department:id,dept_name',
            // 👇 THIS LINE IS THE KEY
            'issues.voucher.requisitionedBy:employee_id,name',
        ])
            ->where('store_category_id', $id)
            ->get();

        $vendors = ProductVendor::orderBy('vendor_name')->get();

        return inertia('Store/productsofcategory', [
            'category' => $category,
            'products' => $products,
            'vendors'  => $vendors,
        ]);
    }

    public function updateStock(Request $request, StoreProduct $product)
    {
        $request->validate([
            'stock_unit_number' => 'required|integer|min:0',
        ]);

        $product->update([
            'stock_unit_number' => $request->stock_unit_number,
        ]);

        return back()->with('success', 'Stock updated successfully');
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255',
        ]);

        $data = $request->only([
            'category_name',
        ]);

        StoreCategory::create($data);

        return back();
    }

    public function updateName(Request $request, StoreProduct $product)
    {
        $request->validate([
            'product_name' => 'required|string|max:255',
        ]);

        $product->update([
            'product_name' => $request->product_name,
        ]);

        return back()->with('success', 'Product name updated');
    }


    public function destroy(StoreProduct $product)
    {
        $product->delete();
        return back()->with('success', 'Product deleted');
    }


}

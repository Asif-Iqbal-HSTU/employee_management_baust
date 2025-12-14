<?php

namespace App\Http\Controllers;

use App\Models\RepairRequest;
use App\Models\StoreCategory;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoreCategoryController extends Controller
{
    public function index()
    {
        $categories = StoreCategory::all();
//        dd($categories);
        return inertia('Store/categoryandproduct', [
            'categories' => $categories,
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

        return inertia('Store/productsofcategory', [
            'category' => $category,
            'products' => $products,
        ]);
    }

}

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

    public function products($id)
    {
        $category = StoreCategory::find($id);
        $products = StoreProduct::where('store_category_id', $id)->get();
        return inertia('Store/productsofcategory', [
            'category' => $category,
            'products' => $products,
        ]);
    }
}

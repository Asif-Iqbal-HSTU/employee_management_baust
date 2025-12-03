<?php

namespace App\Http\Controllers;

use App\Models\StoreProduct;
use Illuminate\Http\Request;

class StoreProductController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'store_category_id' => 'required|exists:store_categories,id',
            'product_name' => 'required|string|max:255',
            'stock_unit_name' => 'required|string|max:255',
            'stock_unit_number' => 'required|integer|min:1',
            'product_image' => 'nullable|image|max:2048',
        ]);

        $data = $request->only([
            'store_category_id',
            'product_name',
            'stock_unit_name',
            'stock_unit_number',
        ]);

        if ($request->hasFile('product_image')) {
            $data['product_image'] = $request->file('product_image')->store('product_images', 'public');
        }

        StoreProduct::create($data);

        return back();
    }

}

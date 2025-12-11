<?php

namespace App\Http\Controllers;

use App\Models\StoreProduct;
use App\Models\StoreReceive;
use Illuminate\Http\Request;

class StoreReceiveController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'store_product_id'   => 'required|exists:store_products,id',
            'date_of_receive'    => 'required|date',
            'from_whom'          => 'required|string|max:255',
            'memo_no'            => 'required|string|max:255',
            'memo_date'          => 'required|date',
            'office_order_no'    => 'required|string|max:255',
            'rate'               => 'required|numeric|min:0',
            'quantity'           => 'required|integer|min:1',
            'warranty_information' => 'nullable|string|max:255',
        ]);

        StoreReceive::create($request->all());

        $product = StoreProduct::where('id', $request->get('store_product_id'))->first();
        $product->stock_unit_number += $request->get('quantity');
        $product->save();

        return back();
    }

}

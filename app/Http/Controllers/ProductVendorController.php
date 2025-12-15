<?php

namespace App\Http\Controllers;

use App\Models\ProductVendor;
use Illuminate\Http\Request;

class ProductVendorController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'vendor_name' => 'required|string|max:255',
        ]);

        $data = $request->only([
            'vendor_name',
        ]);

        ProductVendor::create($data);

        return back();
    }
}

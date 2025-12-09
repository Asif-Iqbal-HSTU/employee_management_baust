<?php

namespace App\Http\Controllers;

use App\Models\OfficeTime;
use Illuminate\Http\Request;

class OfficeTimeController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'in_time'    => 'required',
            'out_time'   => 'required',
        ]);

        OfficeTime::create($request->all());

        return back()->with('success', 'Office time updated successfully');
    }
}

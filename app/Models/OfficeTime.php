<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeTime extends Model
{
    protected $fillable = [
        'start_date',
        'end_date',
        'in_time',
        'out_time'
    ];
}

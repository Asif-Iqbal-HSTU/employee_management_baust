<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DutyRoster extends Model
{
    protected $fillable = [
        'employee_id',
        'date',
        'start_time',
        'end_time',
        'reason',
        'created_by',
        'is_finalized',
    ];
}

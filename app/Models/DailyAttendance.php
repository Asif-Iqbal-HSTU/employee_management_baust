<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class DailyAttendance extends Model
{
    protected $fillable = [
        'employee_id',
        'date',
        'in_time',
        'out_time',
        'status',
        'remarks',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'employee_id', 'employee_id');
    }
}

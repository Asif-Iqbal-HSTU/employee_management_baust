<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'allowed_entry',
        'allowed_exit',
        'weekdays',
        'loop',
    ];

    protected $casts = [
        'weekdays' => 'array',
        'loop' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'employee_id', 'employee_id');
    }
}

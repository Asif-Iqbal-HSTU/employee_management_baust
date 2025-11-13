<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id', 'department', 'submission_date', 'submission_time',
        'contact_person', 'designation', 'contact_no', 'email',
        'device_type', 'brand_model', 'asset_id', 'serial_number',
        'accessories', 'problem_description',
        'job_id', 'date_received', 'received_by',
        'initial_observation', 'expected_delivery',
        'assigned_to', 'assigned_phone', 'status'
    ];

    protected $casts = [
        'accessories' => 'array',
        'submission_date' => 'date',
        'expected_delivery' => 'date',
        'date_received' => 'date',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'name_bangla',
        'post',
        'employment_type',
        'gender',
        'joining_date',
        'date_of_birth',
        'nid_no',
        'mobile_no',
        'parents_name',
        'father_name',
        'mother_name',
        'address',
        'district',
        'employee_class',
        'department_from_sheet',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'employee_id', 'employee_id');
    }
}

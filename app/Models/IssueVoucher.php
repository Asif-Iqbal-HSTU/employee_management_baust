<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IssueVoucher extends Model
{
    protected $fillable = [
        'sl_no',
        'book_no',
//        'specification',
        'requisition_employee_id',
        'receiver_employee_id',
        'department_id',
        'to_be_used_in',
        'to_be_used_in_category',
        'date',
        'allowed_by_head',
        'allowed_by_registrar',
        'issued_by_storeman',
    ];

    // Many-to-many
    public function products()
    {
        return $this->belongsToMany(StoreProduct::class)
            ->withPivot([
                'requisitioned_quantity',
                'issued_quantity',
                'specification',
            ])
            ->withTimestamps();
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function requisitionedBy()
    {
        return $this->belongsTo(User::class, 'requisition_employee_id', 'employee_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_employee_id', 'employee_id');
    }
}


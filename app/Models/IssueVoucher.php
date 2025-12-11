<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IssueVoucher extends Model
{
    use HasFactory;
    protected $guarded = ['created_at','updated_at'];

    // ✔ A voucher belongs to a product
    public function product()
    {
        return $this->belongsTo(StoreProduct::class, 'store_product_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function requisitionedBy()
    {
        return $this->belongsTo(User::class, 'requisition_employee_id', 'employee_id');
    }
}


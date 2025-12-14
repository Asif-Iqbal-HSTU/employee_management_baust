<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreProduct extends Model
{
    use HasFactory;
    protected $guarded = ['created_at','updated_at'];

    public function storeCategory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(StoreCategory::class);
    }

    public function issues(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StoreIssue::class);
    }

    public function receives(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StoreReceive::class);
    }

    // ✔ One product may be used in many vouchers
    public function vouchers()
    {
        return $this->hasMany(IssueVoucher::class, 'store_product_id');
    }


}

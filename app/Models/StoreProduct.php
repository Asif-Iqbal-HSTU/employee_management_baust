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

    public function storeIssues(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StoreIssue::class);
    }

    public function storeReceives(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StoreReceive::class);
    }

    // Many-to-many
    public function vouchers()
    {
        return $this->belongsToMany(IssueVoucher::class)
            ->withPivot([
                'requisitioned_quantity',
                'issued_quantity',
                'specification',
            ])
            ->withTimestamps();
    }


}

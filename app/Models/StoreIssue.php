<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreIssue extends Model
{
    use HasFactory;
    protected $guarded = ['created_at','updated_at'];

    public function storeProduct(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(StoreProduct::class);
    }
}

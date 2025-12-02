<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreCategory extends Model
{
    use HasFactory;
    protected $guarded = ['created_at','updated_at'];

    public function storeProducts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StoreProduct::class);
    }
}

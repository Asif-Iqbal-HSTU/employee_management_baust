<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{

    use HasFactory;
    protected $guarded = ['created_at','updated_at'];

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }
}

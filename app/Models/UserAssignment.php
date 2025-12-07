<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAssignment extends Model
{
    use HasFactory;

    protected $fillable = ['employee_id', 'department_id', 'designation_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'employee_id', 'employee_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function scopeOfficerFaculty($query)
    {
        return $query->whereHas('designation', function($q){
            $q->where('is_officer_faculty', true);
        });
    }

}

